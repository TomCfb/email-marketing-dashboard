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

    const result = {
      klaviyo: { live: false as boolean, fetchedAt: null as string | null, status: klaviyoRes.status },
      tripleWhale: { live: false as boolean, fetchedAt: null as string | null, status: tripleRes.status },
      campaigns: { live: false as boolean, fetchedAt: null as string | null, status: campaignsRes.status },
    };

    try {
      const k = await klaviyoRes.json();
      result.klaviyo.live = !!k?.meta && k.meta.liveSource === 'klaviyo';
      result.klaviyo.fetchedAt = k?.meta?.fetchedAt || null;
    } catch {}

    try {
      const t = await tripleRes.json();
      result.tripleWhale.live = !!t?.meta && t.meta.liveSource === 'triple_whale';
      result.tripleWhale.fetchedAt = t?.meta?.fetchedAt || null;
    } catch {}

    try {
      const c = await campaignsRes.json();
      result.campaigns.live = !!c?.meta && c.meta.liveSource === 'klaviyo';
      result.campaigns.fetchedAt = c?.meta?.fetchedAt || null;
    } catch {}

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
