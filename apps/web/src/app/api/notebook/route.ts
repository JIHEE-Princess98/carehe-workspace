import { NextRequest, NextResponse } from "next/server";

type Notebook = { displayName?: string; createTime?: string };
type Source = { name?: string; displayName?: string; state?: string; originalUrl?: string; mimeType?: string };

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("google_notebook_access_token")?.value;
  const notebookId = process.env.GOOGLE_NOTEBOOK_ID;
  if (!accessToken) return NextResponse.json({ error: "not_connected" }, { status: 401 });
  if (!notebookId) return NextResponse.json({ error: "notebook_not_configured" }, { status: 500 });
  const notebookName = notebookId.replace(/^notebooks\//, "");
  const headers = { Authorization: `Bearer ${accessToken}` };
  const base = `https://notebook.googleapis.com/v1/notebooks/${encodeURIComponent(notebookName)}`;
  const [notebookResponse, sourcesResponse] = await Promise.all([fetch(base, { headers }), fetch(`${base}/sources?pageSize=20`, { headers })]);
  if (notebookResponse.status === 401) return NextResponse.json({ error: "not_connected" }, { status: 401 });
  if (!notebookResponse.ok) return NextResponse.json({ error: "unavailable" }, { status: notebookResponse.status });
  const notebook = (await notebookResponse.json()) as Notebook;
  const sources = sourcesResponse.ok ? ((await sourcesResponse.json()) as { sources?: Source[] }).sources ?? [] : [];
  return NextResponse.json({ displayName: notebook.displayName ?? "Gemini Notebook", createTime: notebook.createTime, sources: sources.map((source) => ({ id: source.name?.split("/").pop(), displayName: source.displayName ?? source.originalUrl ?? "이름 없는 소스", state: source.state ?? "STATE_UNSPECIFIED", originalUrl: source.originalUrl, mimeType: source.mimeType })) });
}
