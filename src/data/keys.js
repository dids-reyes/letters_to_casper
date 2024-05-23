export let render_url;
export let render_base_url;
export let api_key = process.env.REACT_APP_API_KEY;

if (process.env.NODE_ENV === 'development') {
  render_url = 'http://localhost:8000/api/messages';
  render_base_url = 'http://localhost:8000';
} else {
  render_url = process.env.REACT_APP_API_URL;
  render_base_url = process.env.REACT_APP_BASE_URL;
}
