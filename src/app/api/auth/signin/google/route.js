import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

// Force dynamic rendering - this route should never be statically generated
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const fallbackBaseUrl = `${url.protocol}//${url.host}`;
    // Normalize redirect URI - remove trailing slashes and ensure exact match
    let redirectUri = process.env.GOOGLE_REDIRECT_URI || 
      `${fallbackBaseUrl}/api/auth/callback/google`;
    redirectUri = redirectUri.replace(/\/$/, ''); // Remove trailing slash
    const baseUrl = process.env.APP_BASE_URL || new URL(redirectUri).origin;

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      prompt: 'consent',
    });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[OAUTH] Sign-in error:', error);
    const url = new URL(request.url);
    const fallbackBaseUrl = `${url.protocol}//${url.host}`;
    const baseUrl = process.env.APP_BASE_URL || fallbackBaseUrl;
    return NextResponse.redirect(new URL('/?error=signin_failed', baseUrl));
  }
}
