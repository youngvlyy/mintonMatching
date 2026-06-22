// src/pages/Mypage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Header } from "../component/Header";
import Popup from "../component/Popup";
import type { PopupMode } from '../component/type/config';
import { useAuthContext } from "../context/AuthContext";

interface MypageP {
    userid: string;
}

const Mypage = ({ userid }: MypageP) => {
    const navigate = useNavigate();
    const { setUser } = useAuthContext();
    const [name, setName] = useState("");
    const [gender, setGender] = useState("");
    const inputRefName = useRef<HTMLInputElement>(null);
    const inputRefGender = useRef<HTMLInputElement>(null);
    const [namePost, setNamePost] = useState(false);
    const [genderPost, setgenderPost] = useState(false);
    const [openPopup, setopenPopup] = useState(false);
    const [mode, setmode] = useState<PopupMode>("password-auth");

    const auth = (password: string) => {
        if (mode === "password-auth") {
            axios.post(`api/userpasswardauth/${userid}`, { password }).then(res => {
                res.data.success ? setmode("password-change") : alert(res.data.error);
                console.log(res.data.success);
            })
        } else {
            axios.patch(`api/userpasswardauth/${userid}`, { password }).then(res => {
                res.data.success ? alert(res.data.message) : alert(res.data.error);
                console.log(res.data.success);
            })
        }
    }

    useEffect(() => {
        getuser();
    }, []);
    useEffect(() => {
        patchstart(namePost, inputRefName);
    }, [namePost]);
    useEffect(() => {
        patchstart(genderPost, inputRefGender);
    }, [genderPost]);

    const getuser = async () => {
        await axios.get(`api/user/${userid}`).then(res => {
            setName(res.data.name);
            setGender(res.data.gender);
        });
    }
    const patchuser = async (data: { name?: string; gender?: string }) => {
        await axios.patch(`api/user/${userid}`, data).then(res => {
            console.log(res.data);
        });
    }
    const exit = () => {
        navigate(`/`);
    }
    const patchstart = (Post: boolean, inputref: any) => {
        if (Post) {
            inputref.current?.focus();
        }
    }
    const userDel = async () => {
        await axios.delete(`api/user/${userid}`).then(async res => {
            if (res.data.success) {
                alert(res.data.message);
                await axios.post("/api/logout");
                setUser(null);
            } else {
                alert(res.data.error);
            }
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-start justify-center p-4 pt-10">
            <div className="w-full max-w-md">

                {/* 상단 헤더 카드 */}
                <div className="page-card mb-4">
                    <Header exit={exit} title={"마이페이지"} />
                </div>

                {/* 프로필 카드 */}
                <div className="page-card space-y-5">

                    {/* 아이디 */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">아이디</label>
                        <div className="mt-1.5 px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-medium text-sm border border-slate-100">
                            {userid}
                        </div>
                    </div>

                    {/* 이름 */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">이름</label>
                        <div className="mt-1.5 flex items-center gap-2">
                            <input
                                ref={inputRefName}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition focus:outline-none
                                    ${namePost
                                        ? "border-2 border-violet-400 bg-white text-slate-800 focus:ring-2 focus:ring-violet-300"
                                        : "bg-slate-50 text-slate-700 border border-slate-100"
                                    }`}
                                placeholder="이름 입력"
                                required={namePost}
                                readOnly={!namePost}
                                autoFocus={namePost}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (namePost) {
                                        setNamePost(false);
                                        patchuser({ name, gender })
                                    } else {
                                        setNamePost(true)
                                    }
                                }}
                                className={`editBtn ${namePost ? "on" : ""}`}
                            >
                                {namePost ? "확인" : "수정"}
                            </button>
                        </div>
                    </div>

                    {/* 성별 */}
                    <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">성별</label>
                        <div className="mt-1.5 flex items-center gap-2">
                            {genderPost ? (
                                <div className="flex gap-2 flex-1">
                                    <label className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border-2 cursor-pointer transition text-sm font-semibold
                                        ${gender === "M" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="M"
                                            checked={gender === "M"}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="hidden"
                                            required
                                        />
                                        남자
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border-2 cursor-pointer transition text-sm font-semibold
                                        ${gender === "F" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="F"
                                            checked={gender === "F"}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="hidden"
                                        />
                                        여자
                                    </label>
                                </div>
                            ) : (
                                <div className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-slate-50 border border-slate-100
                                    ${gender === "M" ? "text-blue-600" : "text-pink-600"}`}>
                                    {gender === "M" ? "남자" : "여자"}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    if (genderPost) {
                                        setgenderPost(false);
                                        patchuser({ name, gender })
                                    } else {
                                        setgenderPost(true)
                                    }
                                }}
                                className={`editBtn ${genderPost ? "on" : ""}`}
                            >
                                {genderPost ? "확인" : "수정"}
                            </button>
                        </div>
                    </div>

                    {/* 구분선 */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => setopenPopup(true)}
                            className="text-sm font-medium text-violet-600 hover:text-violet-700 text-left hover:underline transition"
                        >
                            비밀번호 변경 →
                        </button>
                        <button
                            type="button"
                            onClick={() => userDel()}
                            className="text-sm text-slate-400 hover:text-red-500 text-left hover:underline transition"
                        >
                            회원탈퇴
                        </button>
                    </div>
                </div>
            </div>

            {openPopup && (
                <Popup
                    mode={mode}
                    auth={auth}
                    close={() => setopenPopup(false)}
                />
            )}
        </div>
    );
};

export default Mypage;
