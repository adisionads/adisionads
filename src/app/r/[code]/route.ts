import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { INITIAL_ASSIGNMENTS } from '@/lib/store/mock-data';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// Patterns matching automated link preview generators and bots
const BOT_USER_AGENT_REGEX =
  /(WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Slackbot|LinkedInBot|Discordbot|Googlebot|bingbot|Baiduspider|YandexBot|DuckDuckBot|curl|Wget|python|axios|Go-http-client|bot|spider|crawler)/i;

/**
 * High-Speed Privacy-Preserving Click Tracking & Attribution Engine
 * Endpoint: GET /r/[code]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const trackingCode = (code || '').trim().toLowerCase();

  // 1. Resolve Target Destination URL
  let destinationUrl = 'https://adision.co?src=tracking_fallback';
  let assignmentId: string | null = null;

  if (isSupabaseAdminConfigured()) {
    try {
      const { data: linkData } = await supabaseAdmin
        .from('tracking_links')
        .select('id, target_url, assignment_id')
        .ilike('tracking_code', trackingCode)
        .single();

      if (linkData?.target_url) {
        destinationUrl = linkData.target_url;
        assignmentId = linkData.assignment_id;
      }
    } catch (err) {
      console.warn('[Tracking Engine] DB lookup failed, checking fallback cache:', err);
    }
  }

  // Fallback to in-memory lookup if not found in DB or DB not configured
  if (!assignmentId) {
    const fallbackAssignment = INITIAL_ASSIGNMENTS.find(
      (a) => a.tracking_code.toLowerCase() === trackingCode
    );
    if (fallbackAssignment?.campaign?.destination_url) {
      destinationUrl = fallbackAssignment.campaign.destination_url;
      assignmentId = fallbackAssignment.id;
    }
  }

  // 2. Telemetry Extraction
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const isBot = BOT_USER_AGENT_REGEX.test(userAgent);

  // If this is an automated link-preview scraper (e.g. WhatsApp generating preview card in chat),
  // redirect immediately WITHOUT recording a human click.
  if (isBot) {
    return NextResponse.redirect(new URL(destinationUrl), {
      status: 302,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Adision-Filter': 'bot-preview-ignored',
      },
    });
  }

  // 3. Privacy-Safe Anonymized Fingerprinting (GDPR & Data Protection Compliant)
  try {
    const rawIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const referer = request.headers.get('referer') || 'whatsapp_direct';
    const salt = process.env.CLICK_HASH_SALT || 'adision-default-telemetry-salt-987';

    const hashedIp = crypto
      .createHash('sha256')
      .update(`${rawIp}:${userAgent}:${salt}`)
      .digest('hex');

    // 4. Record Click Event Asynchronously
    if (isSupabaseAdminConfigured() && assignmentId) {
      // Non-blocking telemetry ingestion
      Promise.resolve().then(async () => {
        try {
          // Check if this hashed fingerprint clicked this link within the last 24 hours
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { count } = await supabaseAdmin
            .from('click_events')
            .select('id', { count: 'exact', head: true })
            .eq('tracking_code', trackingCode)
            .eq('hashed_ip', hashedIp)
            .gte('clicked_at', oneDayAgo);

          const isUnique = !count || count === 0;

          // Insert click event
          await supabaseAdmin.from('click_events').insert({
            tracking_code: trackingCode,
            assignment_id: assignmentId,
            hashed_ip: hashedIp,
            user_agent: userAgent.slice(0, 255),
            referer: referer.slice(0, 255),
            is_unique: isUnique,
            clicked_at: new Date().toISOString(),
          });

          // Increment counters on tracking_links
          if (isUnique) {
            await supabaseAdmin.rpc('increment_tracking_link_clicks', {
              t_code: trackingCode,
              is_unique_click: true,
            });
          }
        } catch (dbErr) {
          console.error('[Tracking DB Ingestion Error]:', dbErr);
        }
      });
    } else {
      console.log(
        `[Click Tracked (Dev Mode)] Code: ${trackingCode} | Target: ${destinationUrl} | Fingerprint: ${hashedIp.slice(0, 10)}... | Referer: ${referer}`
      );
    }
  } catch (error) {
    console.error('[Click Tracking Error]:', error);
  }

  // 5. Immediate HTTP 302 Redirection
  return NextResponse.redirect(new URL(destinationUrl), {
    status: 302,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
