import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const notebookScope = "https://www.googleapis.com/auth/notebook.readonly";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.GOOGLE_APP_URL;
  if (!clientId || !appUrl) return NextResponse.redirect(new URL("/dashboard?notebook=configuration", request.url));

  const returnTo = request.nextUrl.searchParams.get("returnTo");
  const safeReturnTo = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/dashboard";
  const state = randomUUID();
  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.search = new URLSearchParams({ client_id: clientId, redirect_uri: new URL("/api/google/callback", appUrl).toString(), response_type: "code", scope: notebookScope, access_type: "online", prompt: "consent", state }).toString();
  const response = NextResponse.redirect(authorizeUrl);
  const options = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 };
  response.cookies.set("google_notebook_oauth_state", state, options);
  response.cookies.set("google_notebook_return_to", safeReturnTo, options);
  return response;
}
