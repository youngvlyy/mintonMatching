// src/pages/Signup.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../component/AuthLayout";

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("");
    const [overlapck, setOverlapck] = useState(true);
    let [cL, setCL] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cL === 0 || !overlapck) {
            alert("아이디 중복확인을 해주세요");
            return;
        }
        try {
            await axios.post("/api/signup", { name, userid, password, gender });
            alert("회원가입 완료!");
            navigate("/login");
        } catch (err: any) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const overlapCheck = async () => {
        setCL(++cL);
        try {
            const res = await axios.get(`/api/${userid}`);
            if (res.data.success) {
                alert("사용 가능한 아이디입니다.");
                setOverlapck(true);
            } else {
                alert("이미 사용 중인 아이디입니다.");
                setUserid("");
                setOverlapck(false);
            }
        } catch (err: any) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const allck = () => {
        if (!name) alert("이름을 입력해주세요");
        else if (!gender) alert("성별을 체크해주세요");
        else if (!userid) alert("아이디 입력해주세요");
        else if (!password) alert("비밀번호 입력해주세요");
        else if (cL === 0) alert("아이디 중복 확인을 해주세요");
    };

    return (
        <AuthLayout>
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-5">
                <h2 className="text-xl font-bold text-slate-800">회원가입</h2>

                {/* 이름 */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">이름</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-base"
                        placeholder="이름을 입력하세요"
                        required
                    />
                </div>

                {/* 성별 */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">성별</label>
                    <div className="flex gap-3">
                        {(["M", "F"] as const).map((g) => (
                            <label
                                key={g}
                                className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 cursor-pointer transition text-sm font-semibold
                                    ${gender === g
                                        ? g === "M" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-pink-500 bg-pink-50 text-pink-700"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="gender"
                                    value={g}
                                    checked={gender === g}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="hidden"
                                    required={g === "M"}
                                />
                                {g === "M" ? "남자" : "여자"}
                            </label>
                        ))}
                    </div>
                </div>

                {/* 아이디 */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">아이디</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={userid}
                            onChange={(e) => setUserid(e.target.value)}
                            className={`flex-1 border rounded-xl px-4 py-3 text-sm bg-slate-50
                                focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition
                                placeholder:text-slate-400
                                ${!overlapck ? "border-red-400 bg-red-50" : "border-slate-200"}`}
                            placeholder="아이디를 입력하세요"
                            required
                        />
                        <button
                            type="button"
                            onClick={overlapCheck}
                            className="px-4 py-3 text-sm font-semibold rounded-xl bg-slate-800 text-white
                                       hover:bg-slate-700 active:scale-95 transition whitespace-nowrap"
                        >
                            중복확인
                        </button>
                    </div>
                </div>

                {/* 비밀번호 */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-base"
                        placeholder="비밀번호를 입력하세요"
                        required
                    />
                </div>

                <button type="submit" onClick={allck} className="btn-primary w-full">
                    회원가입
                </button>

                <p className="text-sm text-slate-500 text-center">
                    이미 계정이 있으신가요?{" "}
                    <a href="/login" className="text-violet-600 font-semibold hover:underline">
                        로그인
                    </a>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Signup;
