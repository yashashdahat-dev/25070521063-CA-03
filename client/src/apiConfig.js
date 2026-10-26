// Dynamic API Base URL: automatically uses local IP when accessed from phone/network
export const API_BASE = 
  (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? `http://${window.location.hostname}:5000`
    : 'http://localhost:5000';
