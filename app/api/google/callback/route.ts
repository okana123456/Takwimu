import { NextResponse } from "next/server";

type DriveState = {
  programmeId: string;
  driveUrl: string;
  folderId: string;
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
};

function decodeState(state: string | null): DriveState | null {
  if (!state) return null;

  try {
    return JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as DriveState;
  } catch {
    return null;
  }
}

function htmlPage(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; background: #f6f8f7; color: #13201d; }
            main { max-width: 880px; margin: 48px auto; padding: 0 20px; }
            section { background: white; border: 1px solid #dfe7e3; border-radius: 8px; padding: 24px; }
            h1 { margin: 0 0 8px; font-size: 26px; }
            p { color: #5f6f6a; line-height: 1.5; }
            a { color: #087f6b; font-weight: 700; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border-bottom: 1px solid #e5ebe8; padding: 11px 8px; text-align: left; font-size: 14px; }
            th { color: #5f6f6a; font-size: 12px; text-transform: uppercase; }
          </style>
        </head>
        <body><main><section>${body}</section></main></body>
      </html>`,
    {
      status,
      headers: { "content-type": "text/html; charset=utf-8" }
    }
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function exchangeCodeForToken(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google credentials are missing in environment variables.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google token exchange failed: ${message}`);
  }

  return response.json() as Promise<{ access_token: string; refresh_token?: string }>;
}

async function listDriveFiles(accessToken: string, folderId: string) {
  const query = `'${folderId}' in parents and trashed = false`;
  const params = new URLSearchParams({
    q: query,
    pageSize: "50",
    fields: "files(id,name,mimeType,webViewLink,modifiedTime)"
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: { authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Google Drive scan failed: ${message}`);
  }

  return response.json() as Promise<{ files: DriveFile[] }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = decodeState(searchParams.get("state"));

  if (error) {
    return htmlPage("Drive connection cancelled", `<h1>Drive connection cancelled</h1><p>${error}</p>`, 400);
  }

  if (!code || !state?.folderId) {
    return htmlPage(
      "Drive connection failed",
      "<h1>Drive connection failed</h1><p>Google did not return the folder details Takwimu needs.</p>",
      400
    );
  }

  try {
    const token = await exchangeCodeForToken(code);
    const driveData = await listDriveFiles(token.access_token, state.folderId);
    const rows = driveData.files
      .map(
        (file) => `<tr>
          <td>${
            file.webViewLink
              ? `<a href="${escapeHtml(file.webViewLink)}" target="_blank">${escapeHtml(file.name)}</a>`
              : escapeHtml(file.name)
          }</td>
          <td>${escapeHtml(file.mimeType.replace("application/vnd.google-apps.", ""))}</td>
          <td>${file.modifiedTime ? new Date(file.modifiedTime).toLocaleString("en-KE") : "Not available"}</td>
        </tr>`
      )
      .join("");

    return htmlPage(
      "Drive connected",
      `<h1>Drive connected to ${escapeHtml(state.programmeId)}</h1>
       <p>Takwimu can now read this folder. I found <strong>${driveData.files.length}</strong> files in the connected Drive folder.</p>
       <p><a href="/">Back to Takwimu dashboard</a></p>
       <table>
        <thead><tr><th>File</th><th>Type</th><th>Last modified</th></tr></thead>
        <tbody>${rows || "<tr><td colspan=\"3\">No files found in this folder.</td></tr>"}</tbody>
       </table>`
    );
  } catch (connectionError) {
    const message = connectionError instanceof Error ? connectionError.message : "Unknown Google Drive error.";
    return htmlPage("Drive connection failed", `<h1>Drive connection failed</h1><p>${escapeHtml(message)}</p>`, 500);
  }
}
