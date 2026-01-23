import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Force dynamic rendering - this route should never be statically generated
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');

    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('[AUTH] Sign-out error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
