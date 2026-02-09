// src/pages/Signup.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup: React.FC = () => {
    const navigate = useNavigate(); // 페이지 이동 훅
    const [name, setName] = useState("");
    const [userid, setUserid] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("");
    const [overlapck, setOverlapck] = useState(true);
    let [cL, setCL] = useState(0);

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();

        if(cL === 0 || !overlapck){
            alert("아이디 중복확인을 해주세요");
            return;
        }
        //로그인 화면으로 돌아가기
        try {
           await axios.post("/api/signup", {
                name, userid, password, gender
            });
            alert("회원가입 완료!");
            navigate("/login");
        } catch (err:any) {
            alert(err.response?.data?.message || err.message);
        }
    };


    //중복 확인
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

    const allck = ()=>{
        if(!name){
            alert("이름을 입력해주세요");
        }else if(!gender){
            alert("성별을 체크해주세요");
        }else if(!userid){
            alert("아이디 입력해주세요");
        }else if(!password){
            alert("비밀번호 입력해주세요");
        }else if(cL === 0){
            alert("아이디 중복 확인을 해주세요");
        }
    }


    return (
  <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm w-full max-w-sm"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        회원가입
      </h2>

      {/* 이름 */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2 text-sm">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl
                     focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="이름 입력"
          required
        />
      </div>

      {/* 성별 */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2 text-sm">성별</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
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

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="gender"
              value="F"
              checked={gender === "F"}
              onChange={(e) => setGender(e.target.value)}
              className="accent-pink-400"
            />
            여자
          </label>
        </div>
      </div>

      {/* 아이디 */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2 text-sm">아이디</label>
        <div className="w-full flex">
          <input
            type="text"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            className={`flex-1 px-4 py-3 text-sm rounded-xl border
              focus:outline-none focus:ring-1 focus:ring-blue-400
              ${!overlapck ? "border-red-400" : "border-gray-300"}`}
            placeholder="아이디 입력"
            required
          />
          <button
            type="button"
            onClick={overlapCheck}
            className="ml-3 px-4 py-3 text-sm rounded-xl
                       bg-indigo-500 text-white
                       hover:bg-indigo-600 transition"
          >
            중복확인
          </button>
        </div>
      </div>

      {/* 비밀번호 */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2 text-sm">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl
                     focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="비밀번호 입력"
          required
        />
      </div>

      <button
        type="submit"
        onClick={allck}
        className="w-full py-3 rounded-xl text-sm font-medium
                   bg-indigo-500 text-white
                   hover:bg-indigo-600 transition"
      >
        회원가입
      </button>
    </form>
  </div>
);

};

export default Signup;
