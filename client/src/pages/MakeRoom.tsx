import React, { useState } from 'react'

interface MakeRoomP {
    close: () => void;
    addRoom : (tit: string) => any;
    inRoom : (id:string,tit: string) => void;
}

export default function MakeRoom({ close, addRoom, inRoom }: MakeRoomP) {
    const[value, setvalue] = useState("");
    
// 방 만들기
    return (
        <div>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">방 만들기</h2>

                    {/* 입력 */}
                    <input value={value} onChange={(e)=>setvalue(e.target.value)} className="border p-2 w-full" placeholder="방 제목" />

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={close}
                            className="px-3 py-2 bg-gray-300 rounded"
                        >
                            닫기
                        </button>
                        <button
                            onClick={async() => {const{_id,title} = await addRoom(value); console.log(_id);  inRoom(_id, title); close(); }}
                            className="px-4 py-2 ml-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            만들기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
