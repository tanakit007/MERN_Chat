import axios from "axios";
import TokenService from "./token.service";
const baseURL = import.meta.env.VITE_BASE_URL;
console.log(baseURL);
//http://localhost:5000/api/v1

//ใช้ design pattern ชื่อ singleton
const instance = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add interceptor to request object
//ส่งมาแล้วแต่ดักขาไป request
instance.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccessToken();

    // เช็คว่าถ้าไม่ใช่หน้า login หรือ register ถึงจะแนบ token
    const isAuthPage =
      config.url.includes("/login") || config.url.includes("/register");

    if (token && !isAuthPage) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default instance;
