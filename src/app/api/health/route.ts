import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const ts = Date.now();
    const headers = { 'Cache-Control': 'no-store' } as const;

    const [klaviyoRes, tripleRes, campaignsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/klaviyo/metrics?from=${new Date(Date.now() - 90*24*60*60*1000).toISOString()}&to=${new Date().toISOString()}&ts=${ts}`, { cache: 'no-store', headers }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/triple-whale/metrics?from=${new Date(Date.now() - 90*24*60*60*1000).toISOString()}&to=${new Date().toISOString()}&ts=${ts}`, { cache: 'no-store', headers }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/klaviyo/campaigns?ts=${ts}`, { cache: 'no-store', headers }),
    ]);

    type HealthEntry = { live: boolean; fetchedAt: string | null; status: number; error: string | null };
    const result: { klaviyo: HealthEntry; tripleWhale: HealthEntry; campaigns: HealthEntry } = {
      klaviyo: { live: false, fetchedAt: null, status: klaviyoRes.status, error: null },
      tripleWhale: { live: false, fetchedAt: null, status: tripleRes.status, error: null },
      campaigns: { live: false, fetchedAt: null, status: campaignsRes.status, error: null },
    };

    // Helper to parse JSON or text for error details
    const parseResponse = async (res: Response): Promise<unknown> => {
      try {
        return await res.json();
      } catch {
        try {
          const text = await res.text();
          return { error: text } as { error: string };
        } catch {
          return null as unknown;
        }
      }
    };

    const [k, t, c] = await Promise.all([parseResponse(klaviyoRes), parseResponse(tripleRes), parseResponse(campaignsRes)]);

    const readMeta = (obj: unknown): { liveSource?: string; fetchedAt?: string } | null => {
      if (obj && typeof obj === 'object' && 'meta' in obj) {
        const meta = (obj as { meta?: unknown }).meta;
        if (meta && typeof meta === 'object') {
          const m = meta as { liveSource?: unknown; fetchedAt?: unknown };
          return {
            liveSource: typeof m.liveSource === 'string' ? m.liveSource : undefined,
            fetchedAt: typeof m.fetchedAt === 'string' ? m.fetchedAt : undefined,
          };
        }
      }
      return null;
    };

    const readError = (obj: unknown): string | null => {
      if (obj && typeof obj === 'object' && 'error' in obj) {
        const e = (obj as { error?: unknown }).error;
        if (typeof e === 'string') return e;
        if (e && typeof e === 'object' && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
          return (e as { message: string }).message;
        }
      }
      return null;
    };

    const km = readMeta(k);
    if (km) {
      result.klaviyo.live = km.liveSource === 'klaviyo';
      result.klaviyo.fetchedAt = km.fetchedAt || null;
    }
    if (!result.klaviyo.live) {
      result.klaviyo.error = readError(k);
    }

    const tm = readMeta(t);
    if (tm) {
      result.tripleWhale.live = tm.liveSource === 'triple_whale';
      result.tripleWhale.fetchedAt = tm.fetchedAt || null;
    }
    if (!result.tripleWhale.live) {
      result.tripleWhale.error = readError(t);
    }

    const cm = readMeta(c);
    if (cm) {
      result.campaigns.live = cm.liveSource === 'klaviyo';
      result.campaigns.fetchedAt = cm.fetchedAt || null;
    }
    if (!result.campaigns.live) {
      result.campaigns.error = readError(c);
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'Surrogate-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Health check failed', details: (error as Error).message }, { status: 503 });
  }
}
