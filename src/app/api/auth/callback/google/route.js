import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { cookies } from 'next/headers';

// Force dynamic rendering - this route should never be statically generated
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = new URL(request.url);
  const fallbackBaseUrl = `${url.protocol}//${url.host}`;
  // Normalize redirect URI - remove trailing slashes and ensure exact match
  let redirectUri = process.env.GOOGLE_REDIRECT_URI || 
    `${fallbackBaseUrl}/api/auth/callback/google`;
  redirectUri = redirectUri.replace(/\/$/, ''); // Remove trailing slash
  const baseUrl = process.env.APP_BASE_URL || new URL(redirectUri).origin;

  try {
    // Validate required environment variables
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error('[OAUTH] GOOGLE_CLIENT_ID is not set');
      return NextResponse.redirect(
        new URL('/?error=missing_client_id', baseUrl)
      );
    }

    if (!process.env.GOOGLE_CLIENT_SECRET) {
      console.error('[OAUTH] GOOGLE_CLIENT_SECRET is not set');
      return NextResponse.redirect(
        new URL('/?error=missing_client_secret', baseUrl)
      );
    }

    console.log('[OAUTH] Callback received, redirectUri:', redirectUri);

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('[OAUTH] Google OAuth error:', error);
      return NextResponse.redirect(
        new URL('/?error=oauth_failed', baseUrl)
      );
    }

    if (!code) {
      console.error('[OAUTH] No authorization code received');
      return NextResponse.redirect(
        new URL('/?error=no_code', baseUrl)
      );
    }

    console.log('[OAUTH] Exchanging code for tokens, redirectUri:', redirectUri);
    // Exchange authorization code for tokens
    const { tokens } = await client.getToken(code);
    console.log('[OAUTH] Token exchange successful, has id_token:', !!tokens.id_token);
    
    if (!tokens.id_token) {
      console.error('[OAUTH] No ID token received from Google');
      return NextResponse.redirect(
        new URL('/?error=no_token', baseUrl)
      );
    }

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      console.error('[OAUTH] Invalid token payload');
      return NextResponse.redirect(
        new URL('/?error=invalid_token', baseUrl)
      );
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      console.error('[OAUTH] No email in token payload');
      return NextResponse.redirect(
        new URL('/?error=no_email', baseUrl)
      );
    }

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user with default Viewer role
      // OAuth users don't need a passwordHash
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          googleId,
          role: 'Viewer',
          passwordHash: null, // OAuth users don't have passwords
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { email },
        data: { googleId },
      });
    }

    // Create JWT session token
    const sessionToken = await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Validate token was created
    if (!sessionToken || typeof sessionToken !== 'string') {
      console.error('[OAUTH] Failed to create session token');
      return NextResponse.redirect(
        new URL('/?error=token_creation_failed', baseUrl)
      );
    }

    // Set HTTP-only cookie
    console.log('[OAUTH] Setting session cookie, token length:', sessionToken.length);
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    console.log('[OAUTH] Session cookie set, redirecting to home');

    // Redirect to home page
    return NextResponse.redirect(new URL('/', baseUrl));
  } catch (error) {
    console.error('[OAUTH] Callback error:', error);
    console.error('[OAUTH] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      redirectUri,
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    });
    return NextResponse.redirect(
      new URL(`/?error=callback_error&details=${encodeURIComponent(error?.message || 'Unknown error')}`, baseUrl)
    );
  }
}
