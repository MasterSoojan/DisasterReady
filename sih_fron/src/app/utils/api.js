// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',  // Make sure FastAPI is running here
});

export default api;
