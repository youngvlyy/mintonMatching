// src/pages/Signup.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Header } from "../component/Header";
import Popup from "../component/Popup";
import type { PopupMode } from '../component/type/config';

interface MypageP {
    userid: string;
}

const Mypage = ({ userid }: MypageP) => {
    const navigate = useNavigate(); // 페이지 이동 훅
    // const [searchparams] = useSearchParams();
    // const userid: any = searchparams.get("user");
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
            //비밀번호 인증
            axios.post(`api/userpasswardauth/${userid}`, { password }).then(res => {
                res.data.success ? setmode("password-change") : alert(res.data.error);
                console.log(res.data.success);
            })
        } else {
            //비밀번호 변경
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
    //수정 완료
    const patchuser = async (data: { name?: string; gender?: string }) => {
        await axios.patch(`api/user/${userid}`, data).then(res => {
            console.log(res.data);
        });
    }
    const exit = () => {
        navigate(`/`);
    }

    //수정 가능
    const patchstart = (Post: boolean, inputref: any) => {
        if (Post) {
            inputref.current?.focus();
        }
    }

    //회원 탈퇴
    const userDel = async () => {
        await axios.delete(`api/user/${userid}`).then(res => {
            if (res.data.success) {
                alert(res.data.message);
                localStorage.removeItem("token"); // 토큰 삭제
                window.location.reload();
            }
            else {
                alert(res.data.error);
            }
        })

    }


    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">

                {/* 헤더 */}
                <Header exit={exit} title={"마이페이지"} />

                {/* 내용 */}
                <div className="pt-6 space-y-5">
                    {/* 아이디 */}
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">아이디</label>
                        <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800">
                            {userid}
                        </div>
                    </div>
                    {/* 이름 */}
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">이름</label>
                        <div className="w-full flex justify-between">
                            <input
                                ref={inputRefName}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`flex-1 p-2 rounded-lg focus:outline-none  ${namePost ? "border bg-none text-black" : "bg-gray-100 text-gray-800"}`}
                                placeholder="이름 입력"
                                required={namePost}
                                readOnly={!namePost}
                                autoFocus={namePost}
                            />
                            <button type="button" onClick={() => {
                                if (namePost) {
                                    setNamePost(false);
                                    patchuser({ name, gender })
                                } else {
                                    setNamePost(true)
                                }
                            }}
                                className={`editBtn ${namePost ? "on" : null}`}>{namePost ? "확인" : "수정"}</button>
                        </div>
                    </div>

                    {/* 성별 */}
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">성별</label>
                        <div className="w-full flex justify-between">
                            {genderPost ?
                                <div className="flex">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="M"
                                            checked={gender === "M"}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="accent-blue-500"
                                            required
                                        />
                                        남자
                                    </label>

                                    <label className="flex ml-2 items-center gap-2">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="F"
                                            checked={gender === "F"}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="accent-pink-500"
                                        />
                                        여자
                                    </label>
                                </div>
                                :
                                <span
                                    className={`flex-1 p-2 rounded-lg focus:outline-none  bg-gray-100 text-gray-800`}
                                >{gender}</span>
                            }

                            <button type="button" onClick={() => {
                                if (genderPost) {
                                    setgenderPost(false);
                                    patchuser({ name, gender })
                                } else {
                                    setgenderPost(true)
                                }

                            }}
                                className={`editBtn ${genderPost ? "on" : null}`}>{genderPost ? "확인" : "수정"}</button>
                        </div>
                    </div>

                    {/* 비밀번호 */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setopenPopup(true)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            비밀번호 변경
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => userDel()}
                            className="text-sm text-gray-400 hover:underline"
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
