import { createContext, useContext, useEffect, useState } from "react";
import { loginUser } from "../Api/auth.api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = localStorage.getItem("token");
  if(token){

  }
  setLoading(false);
}, []);

  async function login(userName, password) {
    try {
      const res = await loginUser({
        userName,
        password
    });
      localStorage.setItem("token", res.data.token)
      setUser(res.data.user);
      return { 
        success: true,
        user: res.data.user
      };
    } catch (err) {
    // console.log("FULL ERROR:", err);
    // console.log("RESPONSE:", err.response);
    // console.log("RESPONSE DATA:", err.response?.data);
    return {
      success : false,
      message : err.response?.data?.message || "Login Field"
    }
  }
  }
  
  // const logout = () => {
  //   localStorage.removeItem("token");
  //   setUser(null);
  //   navigate("/login")
  // }

  function logout (){
    localStorage.removeItem("token");
    setUser(null);
    window.location.href="/";
  }

  return (
    <AuthContext.Provider value={{ user, notifications, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}