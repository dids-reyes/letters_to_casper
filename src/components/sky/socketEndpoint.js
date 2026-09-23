const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function resolveSkySocketEndpoint({
  configuredUrl = process.env.REACT_APP_SKY_SOCKET_URL,
  baseUrl = process.env.REACT_APP_BASE_URL,
  environment = process.env.NODE_ENV,
  hostname = typeof window !== 'undefined' ? window.location.hostname : '',
} = {}) {
  const browserHost = hostname || 'localhost';
  const isLoopback = LOOPBACK_HOSTS.has(browserHost);
  let endpoint = configuredUrl?.trim() || '';

  if (endpoint && !isLoopback) {
    try {
      const parsed = new URL(endpoint);
      if (LOOPBACK_HOSTS.has(parsed.hostname)) {
        if (environment === 'development') {
          parsed.hostname = browserHost;
          endpoint = parsed.toString().replace(/\/$/, '');
        } else {
          endpoint = '';
        }
      }
    } catch {
      endpoint = '';
    }
  }

  if (!endpoint && environment === 'development') {
    endpoint = `http://${browserHost}:8000`;
  }
  if (!endpoint && environment === 'production') {
    endpoint = baseUrl || 'https://ltc-service.onrender.com';
  }

  return endpoint;
}
