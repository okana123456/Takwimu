import { NextResponse } from "next/server";

function extractDriveFolderId(url: string) {
  const foldersMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (foldersMatch) return foldersMatch[1];

  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch) return idParamMatch[1];

  return null;
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

  return NextResponse.json({
    status: "connected",
    programmeId,
    folderId,
    next: "Google OAuth and Drive file indexing will be connected here."
  });
}
