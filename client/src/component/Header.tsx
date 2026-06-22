import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';

interface BackbtnP {
    exit: () => void;
    title: string | undefined;
}

export function Header({ exit, title }: BackbtnP) {
    return (
        <div className="relative flex items-center justify-center py-1 mb-2">
            <button
                type="button"
                onClick={() => exit()}
                className="absolute left-0 flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500
                           border border-slate-200 rounded-xl hover:bg-slate-50 transition active:scale-95"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
                뒤로
            </button>
            <h1 className="text-lg font-bold text-slate-900">
                {title}
            </h1>
        </div>
    )
}

export function MainHeader() {
    const navigate = useNavigate();
    const { setUser } = useAuthContext();

    const logout = async () => {
        await axios.post("/api/logout");
        setUser(null);
    };

    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm">🏸</span>
                </div>
                <h1 className="text-lg font-bold text-slate-900">
                    MintonMatch
                </h1>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => navigate('/mypage')}
                    className="px-3 py-1.5 text-sm font-medium border border-slate-200
                               rounded-xl hover:bg-slate-50 transition text-slate-600 active:scale-95"
                >
                    마이페이지
                </button>
                <button
                    onClick={logout}
                    className="px-3 py-1.5 text-sm font-medium border border-red-200
                               text-red-500 rounded-xl hover:bg-red-50 transition active:scale-95"
                >
                    로그아웃
                </button>
            </div>
        </div>
    )
}
