import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl mb-3 shadow-lg">
                        <span className="text-2xl">🏸</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">MintonMatch</h1>
                    <p className="text-slate-500 text-sm mt-1">배드민턴 매칭 서비스</p>
                </div>
                {children}
            </div>
        </div>
    );
}
