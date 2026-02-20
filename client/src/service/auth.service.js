import api from "./api";
const API_URL = import.meta.env.VITE_AUTH_API;
import TokenService from "./token.service";

const register = async (fullName, email, password) => {
  try {
    const response = await api.post(API_URL + "/register", {
      fullName,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error; // ส่ง error ไปให้ UI จัดการ toast
  }
};

const login = async (email, password) => {
  try {
    // 1. ยิง API
    const response = await api.post(API_URL + "/login", {
      email,
      password,
    });

    // 2. ดึง data ออกมา (Axios เก็บผลลัพธ์ไว้ใน .data)
    const data = response.data;

    // 3. ตรวจสอบเงื่อนไขสำเร็จ
    // หมายเหตุ: บางครั้ง status อยู่ใน response.status
    if (response.status === 200 && data?.accessToken) {
      TokenService.setUser(data);
      return data; // คืนค่า user object กลับไป
    }

    return data;
  } catch (error) {
    // สำคัญมาก: ถ้า error ต้องโยนออกไป เพื่อให้หน้า Login เข้า catch block และสั่ง setLoading(false)
    console.error(
      "Login Error in Service:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

const logout = () => {
  TokenService.removeUser();
};

const AuthService = {
  register,
  login,
  logout,
};

export default AuthService;
