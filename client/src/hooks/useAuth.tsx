import { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  userid: string;
  exp: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const expireTime = decoded.exp * 1000 - Date.now(); //로그인 시점에서 만료시간 더한값 밀리초 환산 - 현재밀리초

      if (expireTime <= 0) {
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(decoded.userid);
      setLoading(false);

      // 토큰 만료될때 자동 로그아웃
      const timer = setTimeout(() => {
        localStorage.removeItem("token");
        setUser(null);
      }, expireTime);

      return () => clearTimeout(timer);

    } catch {
      setUser(null);
      setLoading(false);
    }

  }, []);

  return { user, loading };
};

