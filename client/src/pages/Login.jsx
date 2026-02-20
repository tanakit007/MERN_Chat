import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Import บริการและ Context ของคุณ
import AuthService from "../service/auth.service";
import { UserContext } from "../context/UserContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // ดึงค่าจาก Context
  const { userInfo, logIn } = useContext(UserContext);

  // 1. ใช้ formData แทนการแยก email, password
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // แจ้งเตือนเมื่อมาจากหน้าสมัครสมาชิก
  useEffect(() => {
    if (location.state?.registered) {
      toast.success("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
      // ล้าง state เพื่อไม่ให้ toast เด้งซ้ำเมื่อ refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // เช็คว่าถ้ามี userInfo อยู่แล้วให้เด้งกลับหน้าแรกทันที
  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  // 2. ฟังก์ชันจัดการการพิมพ์
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // เช็คข้อมูลครบถ้วน
    if (!formData.email || !formData.password) {
      return toast.error("กรุณากรอกข้อมูลให้ครบ");
    }

    const toastId = toast.loading("กำลังเข้าสู่ระบบ...");

    try {
      setIsLoading(true);
      // เรียกใช้ API (AuthService.login คืนค่า user object)
      const res = await AuthService.login(formData.email, formData.password);

      // API ของ server คืน user object (เก็บ token เป็น cookie) ดังนั้นถ้ามี res ถือว่าสำเร็จ
      if (res) {
        logIn(res); // อัปเดตข้อมูลลง Context/LocalStorage
        toast.success("เข้าสู่ระบบสำเร็จ", { id: toastId });

        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      // เพิ่ม logging เพื่อช่วย debug (network / CORS / server response)
      console.error("Login error:", err);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      const errorMsg =
        serverMsg || err.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      // แสดงข้อมูลเพิ่มเติมใน toast ถ้ามีสถานะ
      const toastMsg = status ? `${errorMsg} (status ${status})` : errorMsg;
      toast.error(toastMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0f1218] flex relative overflow-hidden font-sans selection:bg-[#ff7e5f] selection:text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1a1d24",
            color: "#fff",
            border: "1px solid #334155",
          },
          success: { iconTheme: { primary: "#ff7e5f", secondary: "#fff" } },
        }}
      />

      {/* ส่วนที่ 1: ส่วนซ้าย (แบบฟอร์ม Login) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 relative z-10">
        <div className="w-full max-w-[400px]">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 shadow-xl shadow-black/20">
              <MessageSquare className="text-[#ff7e5f] w-10 h-10" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">Welcome Back</h1>
            <p className="text-slate-500">Sign in to your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Input Email */}
            <div className="form-control">
              <label className="label-text text-sm font-bold text-slate-400 block mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:border-[#ff7e5f] focus:ring-1 focus:ring-[#ff7e5f] text-white p-3 outline-none transition-all duration-200"
              />
            </div>

            {/* Input Password */}
            <div className="form-control">
              <label className="label-text text-sm font-bold text-slate-400 block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:border-[#ff7e5f] focus:ring-1 focus:ring-[#ff7e5f] text-white p-3 pr-10 outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff7e5f] hover:bg-[#ff6b4a] disabled:opacity-50 rounded-xl text-white font-bold py-3 shadow-lg shadow-[#ff7e5f]/20 transition-all transform hover:scale-[1.01]"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-8">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-[#ff7e5f] hover:underline font-medium"
            >
              Create account
            </a>
          </p>
        </div>
      </div>

      {/* ส่วนที่ 2: ส่วนขวา (Hero Grid Section) */}
      <div className="hidden lg:flex w-1/2 bg-[#13161c] flex-col justify-center items-center p-12">
        <div className="w-full max-w-[400px] grid grid-cols-3 gap-5 mb-16">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-full aspect-square bg-[#1a1d24] rounded-2xl hover:bg-[#20232b] hover:scale-105 transition-all duration-500 border border-white/5 shadow-2xl"
            ></div>
          ))}
        </div>

        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-white mb-3">Welcome back!</h2>
          <p className="text-slate-500 leading-relaxed">
            Sign in to continue your conversations and catch up with your
            messages.
          </p>
        </div>
      </div>
    </div>
  );
}
