/**
 * Serverless MAS SORA Endpoint
 * Route: /api/sora
 * 
 * Fetches daily SORA rates and 1M/3M/6M compounded averages from the official
 * Monetary Authority of Singapore (MAS) API Gateway.
 * 
 * Target Endpoint:
 * https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
 * 
 * Required Header:
 * KeyId: <MAS_KEY_ID>
 */

const MAS_DAILY_RATES_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export default async function handler(req: any, res: any) {
  // Helper to send JSON responses in both Express/Node (res.status().json())
  // and standard Web API environments (Response object)
  const sendJson = (statusCode: number, data: any) => {
    if (res && typeof res.status === 'function') {
      return res.status(statusCode).json(data);
    }
    return new Response(JSON.stringify(data), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  };

  // Only allow GET requests (and OPTIONS for CORS preflight)
  const method = req?.method || 'GET';
  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      return res.status(204).end();
    }
    return new Response(null, { status: 204 });
  }

  if (method !== 'GET') {
    return sendJson(405, { error: 'Method Not Allowed', message: 'Only GET requests are supported' });
  }

  const masKeyId = process.env.MAS_KEY_ID;

  if (!masKeyId || masKeyId.trim().length === 0) {
    return sendJson(401, {
      error: 'MAS_KEY_ID_MISSING',
      message:
        'The MAS_KEY_ID environment variable is not configured. Please add MAS_KEY_ID to your environment variables to authenticate with the MAS API Gateway.',
      hint: 'Sign in to the MAS API Developer Portal to obtain your KeyId.',
    });
  }

  try {
    // Forward any query parameters if supplied (e.g. rows, start_date, end_date)
    const url = new URL(MAS_DAILY_RATES_ENDPOINT);

    // Parse incoming query params if present
    let queryParams: Record<string, any> = {};
    if (req?.query) {
      queryParams = req.query;
    } else if (req?.url) {
      try {
        const incomingUrl = new URL(req.url, 'http://localhost');
        incomingUrl.searchParams.forEach((val, key) => {
          queryParams[key] = val;
        });
      } catch {
        // Ignore URL parse failure
      }
    }

    // Set default row limit if not specified
    if (!queryParams['rows'] && !queryParams['limit']) {
      url.searchParams.set('rows', '60');
    }

    for (const [k, v] of Object.entries(queryParams)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }

    const masResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        KeyId: masKeyId.trim(),
      },
    });

    if (!masResponse.ok) {
      const errorText = await masResponse.text();
      return sendJson(masResponse.status, {
        error: 'MAS_API_GATEWAY_ERROR',
        status: masResponse.status,
        statusText: masResponse.statusText,
        details: errorText,
      });
    }

    const data = await masResponse.json();

    // MAS response structure usually includes records under result.records or root array/items
    const records =
      data?.result?.records ||
      data?.data ||
      data?.records ||
      (Array.isArray(data) ? data : []);

    // Sort newest to oldest if end_of_day is present
    const sortedRecords = Array.isArray(records)
      ? [...records].sort((a: any, b: any) => {
          const dateA = new Date(a.end_of_day || a.date || 0).getTime();
          const dateB = new Date(b.end_of_day || b.date || 0).getTime();
          return dateB - dateA;
        })
      : [];

    const latest = sortedRecords[0] || {};

    const formattedResponse = {
      source: 'mas-apimg-gateway',
      fetchedAt: new Date().toISOString(),
      endpoint: MAS_DAILY_RATES_ENDPOINT,
      latest: {
        date: latest.end_of_day || latest.date || null,
        dailySora: parseFloat(latest.sora) || null,
        compSora1M: parseFloat(latest.comp_sora_1m) || null,
        compSora3M: parseFloat(latest.comp_sora_3m) || null,
        compSora6M: parseFloat(latest.comp_sora_6m) || null,
        soraIndex: parseFloat(latest.sora_index) || null,
        volume: latest.sora_volume || latest.aggregate_volume || null,
      },
      recordCount: sortedRecords.length,
      records: sortedRecords,
      raw: data,
    };

    return sendJson(200, formattedResponse);
  } catch (error: any) {
    return sendJson(500, {
      error: 'SERVERLESS_PROXY_EXCEPTION',
      message: error?.message || 'Failed to fetch rates from MAS API Gateway',
    });
  }
}
