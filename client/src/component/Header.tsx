import { useNavigate } from 'react-router-dom';

interface BackbtnP {
    exit: () => void;
    title: string | undefined;
}

export function Header({ exit, title }: BackbtnP) {
    return (
        <div>
            <div className="relative flex items-center justify-center">
                <button
                    type="button"
                    onClick={() => exit()}
                    className="absolute left-0 px-3 py-1 text-sm border rounded-lg hover:bg-gray-100"
                >
                    뒤로
                </button>
                <h1 className="text-2xl font-bold">
                    {title}
                </h1>
            </div>

        </div>
    )
}

export function MainHeader() {
    const navigate = useNavigate();

    //마이페이지 으로 들어가기
    const Mypage = () => {
        navigate(`/mypage`);
    }

    //로그아웃
    const logout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900">
                배드민턴 방 목록
            </h1>
            <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300
                                   rounded-lg hover:bg-gray-100 transition"
                    onClick={() => Mypage()}>
                    마이페이지
                </button>
                <button
                    onClick={logout}
                    className="px-3 py-1.5 text-sm border border-red-300
                               text-red-500 rounded-lg hover:bg-red-50 transition"
                >
                    로그아웃
                </button>
            </div>
        </div>
    )
}
