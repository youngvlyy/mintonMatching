// src/pages/Login.tsx
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
    const res = await axios.post("/api/login", { userid, password });

    localStorage.setItem("token", res.data.token);
    alert("로그인 성공!");
    window.location.href = `/`;    
  } catch (err:any) {
    alert(err.response?.data?.message || err.message);
  }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <form
      onSubmit={handleLogin}
      className="bg-white border border-gray-200 rounded-xl p-8 w-96 flex flex-col gap-4 shadow-sm"
    >
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
        로그인
      </h2>

      <input
        type="text"
        placeholder="아이디"
        value={userid}
        onChange={e => setUserid(e.target.value)}
        className="border border-gray-300 rounded-xl px-4 py-3 text-sm
                   focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border border-gray-300 rounded-xl px-4 py-3 text-sm
                   focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      {error && (
        <p className="text-red-500 text-sm text-center">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="bg-indigo-500 text-white py-3 rounded-xl text-sm font-medium
                   hover:bg-indigo-600 transition"
      >
        로그인
      </button>


      <p className="text-sm text-gray-500 text-center mt-2">
        <a href="/signup" className="text-blue-600 hover:underline">
          회원가입
        </a>
      </p>
    </form>
    </div>
  );


}
