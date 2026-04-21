import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_WEBHOOK_URL = process.env.APPS_SCRIPT_WEBHOOK_URL || '';
const APPS_SCRIPT_TOKEN = process.env.APPS_SCRIPT_TOKEN || '';

let cachedStats: { recent_contracts: number; fetchedAt: number } | null = null;
const CACHE_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours cache

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();

    if (cachedStats && now - cachedStats.fetchedAt < CACHE_DURATION_MS) {
      return NextResponse.json({
        ok: true,
        recent_contracts: cachedStats.recent_contracts,
        cached: true,
      });
    }

    if (!APPS_SCRIPT_WEBHOOK_URL) {
      return NextResponse.json({ ok: false, error: 'No webhook URL' }, { status: 500 });
    }

    const response = await fetch(APPS_SCRIPT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: APPS_SCRIPT_TOKEN,
        request_type: 'GET_RECENT_STATS',
        days_back: 45,
      }),
    });

    const data = await response.json();

    if (data.ok) {
      cachedStats = {
        recent_contracts: data.recent_contracts || 0,
        fetchedAt: now,
      };
      return NextResponse.json({
        ok: true,
        recent_contracts: data.recent_contracts || 0,
        cached: false,
      });
    }

    return NextResponse.json({ ok: false, error: data.error }, { status: 500 });
  } catch (err) {
    console.error('Stats API error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
