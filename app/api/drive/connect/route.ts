import { NextResponse } from "next/server";

function extractDriveFolderId(url: string) {
  const foldersMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (foldersMatch) return foldersMatch[1];

  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch) return idParamMatch[1];

  return null;
}

function buildGoogleAuthUrl(programmeId: string, driveUrl: string, folderId: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return null;
  }

  const state = Buffer.from(JSON.stringify({ programmeId, driveUrl, folderId })).toString("base64url");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: "https://www.googleapis.com/auth/drive.readonly",
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const driveUrl = searchParams.get("driveUrl") ?? "";
  const programmeId = searchParams.get("programmeId") ?? "code-clubs";

  const folderId = extractDriveFolderId(driveUrl);
  if (!folderId) {
    return NextResponse.json({ error: "Paste a valid Google Drive folder URL." }, { status: 400 });
  }

  const authUrl = buildGoogleAuthUrl(programmeId, driveUrl, folderId);
  if (!authUrl) {
    return NextResponse.json(
      { error: "Google Drive credentials are missing in Vercel environment variables." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(authUrl);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const driveUrl = body?.driveUrl;
  const programmeId = body?.programmeId;

  if (!driveUrl || typeof driveUrl !== "string") {
    return NextResponse.json({ error: "Drive folder URL is required." }, { status: 400 });
  }

  const folderId = extractDriveFolderId(driveUrl);
  if (!folderId) {
    return NextResponse.json({ error: "Paste a valid Google Drive folder URL." }, { status: 400 });
  }

  const authUrl = buildGoogleAuthUrl(programmeId, driveUrl, folderId);
  if (!authUrl) {
    return NextResponse.json(
      { error: "Google Drive credentials are missing in Vercel environment variables." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "ready_for_google_permission",
    programmeId,
    folderId,
    authUrl
  });
}
