'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const menuItems = [
    {
        name: 'Home',
        href: '/dashboard/home',
        icon: '🏠'
    },
    {
        name: 'Request',
        href: '/dashboard/request',
        icon: '📋'
    },
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: '📊'
    }
]

export default function Sidebar() {
    const pathname = usePathname()
    const [user, setUser] = useState(null)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    return (
        <aside className="w-64 bg-gray-800 text-white min-h-screen">
            {/* User Info */}
            <div className="p-4 border-b border-gray-700">
                {user && (
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                                {user.name.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-300">{user.id}</div>
                            <div className="text-xs text-gray-400">{user.role}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="mt-6">
                <div className="px-4 mb-4">
                    <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                        MAIN MENU
                    </h3>
                </div>

                <ul className="space-y-1 px-2">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${pathname === item.href
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Manage Data Section */}
            <div className="mt-8 px-4">
                <div className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium inline-block mb-4">
                    MANAGE DATA
                </div>
                <Link
                    href="/dashboard/manage-data"
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${pathname === '/dashboard/manage-data'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                >
                    <span className="text-lg">📊</span>
                    <span className="font-medium">Data Management</span>
                </Link>
            </div>
        </aside>
    )
}