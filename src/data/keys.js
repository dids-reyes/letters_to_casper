export let render_url;
export let render_base_url;
export let api_key = process.env.REACT_APP_API_KEY;
const localIP = '192.168.1.106'; // Change this to your local IP address
const useLocalBackend = process.env.REACT_APP_USE_LOCAL_BACKEND === 'true';

if (useLocalBackend) {
  render_url = `http://${localIP}:4000/api/messages`;
  render_base_url = `http://${localIP}:4000`;
} else {
  render_url = process.env.REACT_APP_API_URL?.replace(/\/+$/, '');
  render_base_url = process.env.REACT_APP_BASE_URL?.replace(/\/+$/, '');
}
