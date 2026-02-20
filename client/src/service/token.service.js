import { Cookies } from "react-cookie";

// Create a cookie instance
const cookies = new Cookies();

// Read stored user (parse JSON). If parse fails, remove cookie and return null.
const getUser = () => {
  const user = cookies.get("user");
  if (!user) return null;
  try {
    return typeof user === "string" ? JSON.parse(user) : user;
  } catch (e) {
    removeUser();
    return null;
  }
};

// Return access token string (or empty string)
const getAccessToken = () => {
  const user = getUser();
  return user?.accessToken || "";
};

// Persist user fields needed by the client
const setUser = (user) => {
  if (!user) return removeUser();

  const payload = {
    id: user.id || user._id,
    fullName: user.fullName || user.name || user.username || "",
    email: user.email || "",
    profilePic: user.profilePic || user.profile || null,
    accessToken: user.accessToken || "",
  };

  cookies.set("user", JSON.stringify(payload), {
    path: "/",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
};

const removeUser = () => {
  cookies.remove("user", { path: "/" });
};

export default {
  getUser,
  getAccessToken,
  setUser,
  removeUser,
};
