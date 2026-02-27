import React, { useState, useContext, useEffect, useRef } from "react";
import { User, Mail, Camera, Loader2 } from "lucide-react";
import { UserContext } from "../context/UserContext";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { userInfo, logIn } = useContext(UserContext);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [fullName, setFullName] = useState(userInfo?.fullName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(userInfo?.profilePic || null);

  const fileInputRef = useRef(null);

  // Sync ข้อมูลจาก Context เผื่อมีการเปลี่ยนแปลงจากที่อื่น
  useEffect(() => {
    if (userInfo) {
      setFullName(userInfo.fullName || "");
      setPreview(userInfo.profilePic || null);
    }
  }, [userInfo]);

  const handleSave = async () => {
    if (!fullName.trim()) return toast.error("กรุณากรอกชื่อเต็ม");

    setIsSaving(true);
    try {
      // 1. เรียก API อัปเดตไปยัง Backend
      const res = await updateProfile({
        fullName,
        profilePic: preview, // ส่ง Base64 หรือ URL ใหม่ไป
      });

      // 2. นำข้อมูล user ที่ Backend ส่งกลับมา (ที่มี URL รูปจริง) อัปเดตลง Context
      // res.user คือข้อมูลที่เราแก้ใน user.controller.js ให้ส่งกลับมา
      if (res && res.user) {
        logIn(res.user);
      } else {
        // กรณี Backend ไม่ส่ง user กลับมา ให้ใช้ค่าเดิมที่มี
        logIn({ ...userInfo, fullName, profilePic: preview });
      }

      toast.success("อัปเดตโปรไฟล์สำเร็จ");
      setIsEditing(false);
    } catch (e) {
      console.error("Profile update failed:", e);
      toast.error(e?.response?.data?.message || "อัปเดตโปรไฟล์ไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // จำกัดขนาดไฟล์ไม่เกิน 2MB (Cloudinary/Express อาจมี Limit)
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("ขนาดไฟล์ต้องไม่เกิน 2MB");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setIsEditing(true); // เปิดโหมดแก้ไขทันทีเมื่อเลือกรูป
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-transparent text-slate-800 dark:text-slate-300 p-4 sm:p-6 md:p-8 flex justify-center items-start pt-8 sm:pt-12 md:pt-20 transition-colors duration-300">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm fade-in">
        <div className="flex flex-col items-center mb-6 md:mb-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">
            Your profile information
          </p>

          <div className="flex flex-col items-center">
            <div className="relative mb-3 sm:mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
                {preview ? (
                  <img
                    src={preview}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User
                    size={40}
                    className="sm:w-12 sm:h-12 md:w-14 md:h-14 text-slate-400 dark:text-slate-500"
                  />
                )}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="absolute bottom-0 right-0 bg-[#ff7e5f] hover:bg-[#ff6b4a] p-2 sm:p-2.5 rounded-full text-white transition-colors shadow-md border-2 border-white dark:border-slate-900 disabled:opacity-50"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              {isSaving
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5 mb-8 md:mb-10">
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <User size={14} /> Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (!isEditing) setIsEditing(true);
              }}
              readOnly={!isEditing || isSaving}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#ff7e5f] transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              value={userInfo?.email || ""}
              readOnly
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mb-6">
          {isEditing && (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFullName(userInfo?.fullName || "");
                  setPreview(userInfo?.profilePic || null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#ff7e5f] hover:bg-[#ff6b4a] text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#ff7e5f]/20 transition-all flex items-center gap-2 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </>
          )}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#ff7e5f] hover:text-[#ff6b4a] text-sm font-medium underline-offset-4 hover:underline transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-4">
            Account Information
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-slate-500">Member Since</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {userInfo?.createdAt
                  ? new Date(userInfo.createdAt).toLocaleDateString()
                  : "2025-03-11"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account Status</span>
              <span className="text-emerald-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
