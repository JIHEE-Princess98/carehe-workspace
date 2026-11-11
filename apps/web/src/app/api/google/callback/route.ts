import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const appUrl = process.env.GOOGLE_APP_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const returnTo = request.cookies.get("google_notebook_return_to")?.value || "/dashboard";
  const destination = new URL(returnTo, request.url);
  const clearOptions = { path: "/", maxAge: 0 };
  if (!appUrl || !clientId || !clientSecret || !code || !state || state !== request.cookies.get("google_notebook_oauth_state")?.value) {
    destination.searchParams.set("notebook", "authorization_failed");
    const response = NextResponse.redirect(destination);
    response.cookies.set("google_notebook_oauth_state", "", clearOptions);
    response.cookies.set("google_notebook_return_to", "", clearOptions);
    return response;
  }
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: new URL("/api/google/callback", appUrl).toString(), grant_type: "authorization_code" }) });
  const token = (await tokenResponse.json()) as { access_token?: string; expires_in?: number };
  destination.searchParams.set("notebook", tokenResponse.ok && token.access_token ? "connected" : "authorization_failed");
  const response = NextResponse.redirect(destination);
  response.cookies.set("google_notebook_oauth_state", "", clearOptions);
  response.cookies.set("google_notebook_return_to", "", clearOptions);
  if (tokenResponse.ok && token.access_token) {
    // shortcut: session lasts only for Google's access-token lifetime; add encrypted refresh-token storage with real user accounts.
    response.cookies.set("google_notebook_access_token", token.access_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: token.expires_in ?? 3600 });
  }
  return response;
}
