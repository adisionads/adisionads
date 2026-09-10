import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';
import { UserRole } from '@/types';

export interface VerifiedAuthUser {
  id: string;
  email?: string;
  role: UserRole;
}

/**
 * Verify incoming server request authentication.
 * Extracts Bearer token from the Authorization header (or Supabase auth cookies)
 * and cryptographically verifies it with Supabase Auth.
 */
export async function verifyServerAuth(request: NextRequest): Promise<{
  user: VerifiedAuthUser | null;
  error: string | null;
}> {
  // If Supabase is not configured (local sandbox mode without keys)
  if (!isSupabaseAdminConfigured()) {
    return {
      user: { id: 'sandbox_admin_user', role: 'ADMIN', email: 'sandbox@adision.test' },
      error: null,
    };
  }

  // 1. Extract token from Authorization header
  let token = '';
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Fallback to cookies if token not in Authorization header
  if (!token) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookiePairs = cookieHeader.split(';').map((c) => c.trim().split('='));
    for (const [key, ...rest] of cookiePairs) {
      if (key && (key.startsWith('sb-') && key.endsWith('-auth-token'))) {
        try {
          const rawVal = decodeURIComponent(rest.join('='));
          const parsed = JSON.parse(rawVal);
          token = Array.isArray(parsed) ? parsed[0] : parsed?.access_token || '';
          if (token) break;
        } catch {
          // If not JSON, it might be raw token
          token = decodeURIComponent(rest.join('='));
        }
      }
    }
  }

  if (!token) {
    return { user: null, error: 'Authentication token is missing. Please log in.' };
  }

  try {
    // 3. Cryptographically verify token with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return { user: null, error: error?.message || 'Invalid or expired session token.' };
    }

    const authUser = data.user;

    // 4. Fetch authoritative user profile to verify role
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role, email')
      .eq('id', authUser.id)
      .single();

    if (profileErr || !profile) {
      const metaRole = (authUser.user_metadata?.role as UserRole) || 'ADVERTISER';
      return {
        user: { id: authUser.id, email: authUser.email, role: metaRole },
        error: null,
      };
    }

    return {
      user: {
        id: profile.id,
        email: profile.email || authUser.email,
        role: profile.role,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('[verifyServerAuth Catch]:', err);
    return { user: null, error: err.message || 'Authentication verification failed.' };
  }
}

/**
 * Guard: Strictly requires the requesting user to be an authenticated ADMIN.
 */
export async function requireAdmin(request: NextRequest): Promise<{
  authorized: boolean;
  user?: VerifiedAuthUser;
  errorResponse?: NextResponse;
}> {
  const { user, error } = await verifyServerAuth(request);
  if (!user) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: error || 'Unauthorized: Please log in as an administrator.' },
        { status: 401 }
      ),
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

/**
 * Guard: Requires any authenticated user (with optional role check).
 */
export async function requireUser(
  request: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{
  authorized: boolean;
  user?: VerifiedAuthUser;
  errorResponse?: NextResponse;
}> {
  const { user, error } = await verifyServerAuth(request);
  if (!user) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: error || 'Unauthorized: Active user session required.' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role) && user.role !== 'ADMIN') {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to perform this action.' },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}
