const useLocalBackend = process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_USE_LOCAL_BACKEND !== 'true';
const localBaseUrl = (process.env.REACT_APP_LOCAL_API_BASE_URL ||
  `http://${window.location.hostname}:8000`).replace(/\/+$/, '');

export const render_base_url = useLocalBackend
  ? localBaseUrl
  : process.env.REACT_APP_BASE_URL?.replace(/\/+$/, '');
export const render_url = useLocalBackend
  ? `${localBaseUrl}/api/messages`
  : process.env.REACT_APP_API_URL?.replace(/\/+$/, '');
export const api_key = process.env.REACT_APP_API_KEY;
