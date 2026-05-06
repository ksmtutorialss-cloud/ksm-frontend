// config.js
const isProduction = import.meta.env.PROD;

export const API_URL = isProduction 
  ? 'https://ksm-backend-7q5u.onrender.com'  // REPLACE with your Render URL
  : 'http://localhost:8000';

export const SOCKET_URL = isProduction
  ? 'https://ksm-backend-7q5u.onrender.com'
  : 'http://localhost:8000';

export default { API_URL, SOCKET_URL };