import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../component/AuthLayout";
import { useAuthContext } from "../context/AuthContext";

export default function Login() {
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { setUser } = useAuthContext();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const res = await axios.post("/api/login", { userid, password });
            setUser(res.data.userid);
            navigate("/");
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <AuthLayout>
            <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-5">
                <h2 className="text-xl font-bold text-slate-800">로그인</h2>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">아이디</label>
                    <input
                        type="text"
                        placeholder="아이디를 입력하세요"
                        value={userid}
                        onChange={e => setUserid(e.target.value)}
                        className="input-base"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">비밀번호</label>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="input-base"
                    />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button type="submit" className="btn-primary w-full">
                    로그인
                </button>

                <p className="text-sm text-slate-500 text-center">
                    계정이 없으신가요?{" "}
                    <a href="/signup" className="text-violet-600 font-semibold hover:underline">
                        회원가입
                    </a>
                </p>
            </form>
        </AuthLayout>
    );
}
