// config.js
const isProduction = import.meta.env.PROD;

export const API_URL = isProduction 
  ? 'https://ksm-backend-4q3g.onrender.com'  // REPLACE with your Render URL
  : 'http://localhost:8000';

export const SOCKET_URL = isProduction
  ? 'https://ksm-backend-4q3g.onrender.com'
  : 'http://localhost:8000';

export default { API_URL, SOCKET_URL };
