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
        <div>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">{config.title}</h2>

                    {/* 입력 */}
                    <input value={value} onChange={(e)=>setvalue(e.target.value)} className="border p-2 w-full" placeholder={config.placeholder}/>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={close}
                            className="px-3 py-2 bg-gray-300 rounded"
                        >
                            닫기
                        </button>
                        <button
                            onClick={async() =>  {
                                if(mode === "roomMake"){
                                    if (!addRoom || !inRoom) return; //가드
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
                            className="px-4 py-2 ml-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {config.btn}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
