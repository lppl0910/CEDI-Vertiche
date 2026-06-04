export const API_URLS = {
  auth:      import.meta.env.VITE_AUTH_API_URL      ?? 'http://localhost:3003',
  monitoreo: import.meta.env.VITE_MONITOREO_API_URL ?? 'http://localhost:3002',
  rfid:      import.meta.env.VITE_RFID_API_URL      ?? 'http://localhost:3001',
  ventas:    import.meta.env.VITE_VENTAS_API_URL     ?? 'http://localhost:8080',
  chatbot:   import.meta.env.VITE_CHATBOT_API_URL    ?? 'http://localhost:8090',
};
