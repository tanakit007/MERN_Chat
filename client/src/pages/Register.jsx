import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

export default function Register() {
  const navigate = useNavigate();

  // ดึงฟังก์ชันมาจาก Zustand Store
  const { register: registerUser, isRegister } = useAuthStore();

  // 1. รวบ State เป็น formData Object
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);

  // 2. ฟังก์ชันจัดการการพิมพ์ (Handle Change)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. ฟังก์ชันตรวจสอบข้อมูล (Validation)
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("กรุณากรอกชื่อเต็ม");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("กรุณากรอกอีเมล");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("รูปแบบอีเมลไม่ถูกต้อง");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("กรุณากรอกพาสเวิร์ด");
      return false;
    }
    // if (formData.password.length < 6) {
    //   toast.error("พาสเวิร์ดต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
    //   return false;
    // }
    return true;
  };

  // 4. ฟังก์ชันส่งข้อมูล (Submit)
  const handleRegister = async (e) => {
    e.preventDefault();

    const success = validateForm();
    if (success !== true) return;

    const toastId = toast.loading("กำลังสมัครสมาชิก...");

    try {
      setLoading(true);

      // เรียกใช้ register จาก Zustand store (ส่งเป็น object)
      const res = await registerUser(formData);

      // ถ้าได้ response กลับมา ถือว่าสำเร็จ
      if (res) {
        toast.success("สมัครสมาชิกสำเร็จ!", { id: toastId });
        setTimeout(() => {
          navigate("/login", { state: { registered: true } });
        }, 1500);
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || "ไม่สามารถสมัครสมาชิกได้";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
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
        }}
      />

      {/* ฝั่งซ้าย: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 relative z-10">
        <div className="w-full max-w-[400px]">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <MessageSquare className="text-[#ff7e5f] w-10 h-10" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">
              Create Account
            </h1>
            <p className="text-slate-500">Get started with your free account</p>
          </div>

          <form className="space-y-6" onSubmit={handleRegister}>
            {/* Full Name */}
            <div className="form-control">
              <label className="label-text text-sm font-bold text-slate-400 block mb-2">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:border-[#ff7e5f] focus:ring-1 focus:ring-[#ff7e5f] text-white p-3 outline-none transition-all"
              />
            </div>

            {/* Email */}
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
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:border-[#ff7e5f] focus:ring-1 focus:ring-[#ff7e5f] text-white p-3 outline-none transition-all"
              />
            </div>

            {/* Password */}
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
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:border-[#ff7e5f] focus:ring-1 focus:ring-[#ff7e5f] text-white p-3 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff7e5f] hover:bg-[#ff6b4a] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-8">
            Already have an account?{" "}
            <a href="/login" className="text-[#ff7e5f] hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* ฝั่งขวา: Decorative Grid (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-[#13161c] flex-col justify-center items-center p-12">
        <div className="grid grid-cols-3 gap-5 mb-16">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-20 h-20 bg-[#1a1d24] rounded-2xl border border-white/5 shadow-2xl"
            ></div>
          ))}
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-3">
            Join our community
          </h2>
          <p className="text-slate-500">
            Connect with friends, share moments, and stay in touch.
          </p>
        </div>
      </div>
    </div>
  );
}
