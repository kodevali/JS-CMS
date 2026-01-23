import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

const TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Create a JWT session token from user data
 * @param {Object} user - User object with id, email, name, role
 * @returns {Promise<string>} JWT token
 */
export async function createSession(user) {
  try {
    // Validate user data
    if (!user || !user.id || !user.email) {
      throw new Error('Invalid user data for session creation');
    }

    const token = await new SignJWT({
      id: String(user.id),
      email: String(user.email),
      name: String(user.name || user.email.split('@')[0]),
      role: String(user.role || 'Viewer'),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION / 1000)
      .sign(JWT_SECRET);

    if (!token || typeof token !== 'string') {
      throw new Error('Failed to create JWT token');
    }

    return token;
  } catch (error) {
    console.error('[AUTH] Error creating session:', error);
    throw error;
  }
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object|null>} Decoded token payload or null if invalid
 */
export async function verifySession(token) {
  try {
    if (!token || typeof token !== 'string') {
      console.error('[AUTH] Invalid token type:', typeof token);
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Validate payload structure
    if (!payload || !payload.id || !payload.email) {
      console.error('[AUTH] Invalid token payload structure');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.message);
    return null;
  }
}

/**
 * Extract and verify JWT from request cookies
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object|null>} Session data or null if not authenticated
 */
export async function getSessionFromRequest(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return null;
    }

    const session = await verifySession(token);
    return session;
  } catch (error) {
    console.error('[AUTH] Error getting session from request:', error);
    return null;
  }
}

/**
 * Get session from server-side (for server actions)
 * This is a convenience function that works with Next.js cookies()
 * Always checks database for current role to ensure role changes are reflected immediately
 * @returns {Promise<Object|null>} Session data or null if not authenticated
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return null;
    }

    const session = await verifySession(token);
    if (!session) {
      return null;
    }

    // Always verify role from database to ensure role changes are reflected immediately
    // This prevents issues where JWT has old role but database has updated role
    const { prisma } = await import('@/lib/db');
    const dbUser = await prisma.user.findUnique({
      where: { email: session.email },
      select: { role: true }
    });

    // Use database role if available, otherwise fall back to JWT role
    const currentRole = dbUser?.role || session.role || 'Viewer';

    return {
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: currentRole,
      },
    };
  } catch (error) {
    console.error('[AUTH] Error getting session:', error);
    return null;
  }
}
