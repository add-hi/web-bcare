'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Topbar() {
    const [user, setUser] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('user')
        router.push('/login')
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* Bagian Kiri - Dark/Teal (sesuai sidebar) */}
            <div className="flex">
                <div className="w-64 bg-slate-700 text-white px-6 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                    <Image
                        src="/images/logo/bni-logo.png"
                        alt="BNI Logo"
                        width={100}
                        height={40}
                        priority
                    />
                </div>

                {/* Bagian Kanan - Light */}
                <div className="flex-1 bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xxl font-semibold text-blue-600">CX COMM V2</h1>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {user.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">{user.name}</div>
                                        <div className="text-gray-500">{user.id}</div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleLogout}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                                LOGOUT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}