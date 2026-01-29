import React from 'react'

interface BackbtnP {
    exit: () => void;
    title: string | undefined;
}
export default function Header({ exit, title }: BackbtnP) {
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
