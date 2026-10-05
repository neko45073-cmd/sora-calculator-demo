/**
 * Serverless Health Check Endpoint
 * Route: /api/health
 */

export default async function handler(req: any, res: any) {
  const masKeyId = process.env.MAS_KEY_ID;
  const isKeyConfigured = Boolean(masKeyId && masKeyId.trim().length > 0);

  const payload = {
    status: 'ok',
    service: 'MAS SORA Serverless API',
    masKeyConfigured: isKeyConfigured,
    endpoints: {
      health: '/api/health',
      sora: '/api/sora',
    },
    timestamp: new Date().toISOString(),
  };

  // Support Express / Node / Vercel res.status().json()
  if (res && typeof res.status === 'function') {
    return res.status(200).json(payload);
  }

  // Support Web standard Request/Response environments
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
