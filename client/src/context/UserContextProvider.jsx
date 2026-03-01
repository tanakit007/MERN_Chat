import { useState, useEffect } from "react";
import { UserContext } from "./UserContext.jsx";
import TokenService from "../service/token.service.js";
import { useAuthStore } from "../store/useAuthStore.js";

export const UserContextProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(getUser);
  const connectSocket = useAuthStore((s) => s.connectSocket);
  const disconnectSocket = useAuthStore((s) => s.disconnectSocket);

  const logIn = (user) => {
    setUserInfo(user);
    connectSocket(user);
  };

  const logout = () => {
    setUserInfo(null);
    TokenService.removeUser();
    disconnectSocket();
  };

  function getUser() {
    const saveUser = TokenService.getUser() || null;
    return saveUser;
  }

  useEffect(() => {
    TokenService.setUser(userInfo);
    if (userInfo) {
      connectSocket(userInfo);
    }
  }, [userInfo]);

  return (
    <UserContext.Provider value={{ userInfo, logIn, logout }}>
      {children}
    </UserContext.Provider>
  );
};
