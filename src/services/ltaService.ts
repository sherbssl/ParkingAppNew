export interface LtaCarparkRecord {
  CarParkID: string;
  Area?: string;
  Development: string;
  Location?: string; // e.g. "1.2934 103.8572"
  AvailableLots: number | string;
  LotType: 'C' | 'H' | 'Y' | string;
  Agency?: 'HDB' | 'LTA' | 'URA' | string;
}

export interface LtaFetchResponse {
  success: boolean;
  source: 'lta_datamall' | 'simulated_backup' | 'server_error';
  timestamp?: string;
  value: LtaCarparkRecord[];
  message?: string;
  error?: string;
}

export async function fetchLtaCarparkAvailability(customAccountKey?: string): Promise<LtaFetchResponse> {
  try {
    const headers: Record<string, string> = {};
    if (customAccountKey) {
      headers['accountkey'] = customAccountKey;
    }

    const response = await fetch('/api/carparks/availability', {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return {
        success: false,
        source: 'server_error',
        value: [],
        error: errJson.error || `HTTP ${response.status}`,
      };
    }

    const data: LtaFetchResponse = await response.json();
    return data;
  } catch (err: any) {
    console.warn('Could not connect to /api/carparks/availability, using local fallback:', err);
    return {
      success: true,
      source: 'simulated_backup',
      value: [],
      message: 'Network offline, using local real-time feed',
    };
  }
}
