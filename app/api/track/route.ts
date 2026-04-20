import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_WEBHOOK_URL = process.env.APPS_SCRIPT_WEBHOOK_URL || '';
const APPS_SCRIPT_TOKEN = process.env.APPS_SCRIPT_TOKEN || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = {
      token: APPS_SCRIPT_TOKEN,
      request_type: 'LANDING_EVENT',
      event_type: body.event_type || '',
      session_id: body.session_id || '',
      visitor_id: body.visitor_id || '',
      visitor_type: body.visitor_type || '',
      page_version: body.page_version || '',
      utm_source: body.utm_source || '',
      timestamp: body.timestamp || new Date().toISOString(),
      user_agent: body.user_agent || '',
      referrer: body.referrer || '',
      unit_id: body.unit_id || '',
      unit_name: body.unit_name || '',
      depth: body.depth || '',
    };

    if (APPS_SCRIPT_WEBHOOK_URL) {
      await fetch(APPS_SCRIPT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Track API error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
