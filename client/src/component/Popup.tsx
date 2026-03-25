import { useState } from 'react'
import { CONFIG } from './type/config';
import type { PopupMode } from './type/config';

interface PopupP{
    mode: PopupMode;
    close : ()=>void;
    auth?: (password: string) => void;
    addRoom?: (tit: string) => Promise<{ _id: string; title: string }>;
    inRoom?: (id: string, tit: string) => void;
}

export default function Popup({mode, auth, close, addRoom, inRoom }:PopupP) {
    const[value, setvalue] = useState("");
    const config = CONFIG[mode];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <h2 className="text-lg font-bold text-slate-900">{config.title}</h2>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 space-y-4">
                    <input
                        value={value}
                        onChange={(e) => setvalue(e.target.value)}
                        className="input-base"
                        placeholder={config.placeholder}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    />

                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={close}
                            className="btn-secondary"
                        >
                            닫기
                        </button>
                        <button
                            onClick={async() => {
                                if(mode === "roomMake"){
                                    if (!addRoom || !inRoom) return;
                                    const{_id,title} = await addRoom(value); inRoom(_id, title); close();
                                }else if(mode === "password-auth"){
                                    if (!auth) return;
                                    auth(value);
                                    setvalue("");
                                }else if(mode ==="password-change"){
                                    if (!auth) return;
                                    auth(value);
                                    close();
                                }
                            }}
                            className="px-5 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl
                                       hover:bg-violet-700 active:scale-[0.98] transition-all shadow-sm"
                        >
                            {config.btn}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
