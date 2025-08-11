'use client'
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
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded font-bold">
                        BNI
                    </div>
                    <h1 className="text-xl font-semibold text-blue-600">CX Communication</h1>
                </div>

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
        </header>
    )
}