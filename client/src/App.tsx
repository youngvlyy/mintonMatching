import { useAuth } from "./hooks/useAuth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Main from "./pages/Main";
import GameRoom from "./pages/GameRoom"
import Mypage from "./pages/Mypage";


function App() {
  const {user, loading} = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  // const token = localStorage.getItem("token");

  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 안 된 상태면 로그인/회원가입 접근 가능 */}
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace/>} />
          </>
        ) : (
          <>
            {/* 로그인 된 상태면 홈 페이지 접근 */}
            <Route path="/" element={<Main/>} />
            <Route path="/mypage" element={<Mypage userid={user}/>} />
            <Route path="/gameroom/:roomid/:roomtit" element={<GameRoom userid={user}/>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
