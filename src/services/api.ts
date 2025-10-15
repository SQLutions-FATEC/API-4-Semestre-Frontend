import axios from "axios";

// Define a URL base dependendo do ambiente
const baseURL =
  import.meta.env.MODE === "mock"
    ? "/" // modo mock (sem back)
    : import.meta.env.VITE_API_URL || "http://localhost:8080"; // local por padrão

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // importante para CORS com allowCredentials(true)
});

export default api;
