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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-lg p-8 w-96 flex flex-col gap-4"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">로그인</h2>

        <input
          type="id"
          placeholder="아이디"
          value={userid}
          onChange={e => setUserid(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          로그인
        </button>

        <p className="text-sm text-gray-500 text-center mt-2">
          <a href="/signup" className="text-blue-600 hover:underline">회원가입</a>
        </p>
      </form>
    </div>
  );
}
