import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { INITIAL_ASSIGNMENTS } from '@/lib/store/mock-data';

export const runtime = 'nodejs';

/**
 * Low-Latency Click Tracking & Attribution Engine
 * Endpoint: GET /r/[code]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const trackingCode = code;

  // 1. Resolve Target Destination URL
  // In production with Supabase: query tracking_links table
  // Fallback to in-memory lookup:
  const assignment = INITIAL_ASSIGNMENTS.find(
    (a) => a.tracking_code.toLowerCase() === trackingCode.toLowerCase()
  );

  const destinationUrl =
    assignment?.campaign?.destination_url || 'https://adision.co?src=tracking_fallback';

  // 2. Anonymized Telemetry Hashing (GDPR & Privacy Safe)
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referer = request.headers.get('referer') || 'whatsapp_direct';
    const salt = process.env.CLICK_HASH_SALT || 'adision-default-salt';

    const hashedIp = crypto
      .createHash('sha256')
      .update(`${ip}:${userAgent}:${salt}`)
      .digest('hex');

    // Asynchronously log click telemetry (non-blocking)
    console.log(`[Click Tracked] Code: ${trackingCode} | Target: ${destinationUrl} | Hash: ${hashedIp.slice(0, 10)}... | Referer: ${referer}`);
  } catch (error) {
    console.error('[Click Tracking Error]:', error);
  }

  // 3. Immediate HTTP 302 Redirection
  return NextResponse.redirect(new URL(destinationUrl), {
    status: 302,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
