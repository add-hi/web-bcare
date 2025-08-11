'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    })
    const router = useRouter()

    const handleLogin = async (e) => {
        e.preventDefault()

        // Simulasi login - ganti dengan API call sebenarnya
        if (credentials.username === 'admin' && credentials.password === 'password') {
            // Set session/token di sini
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('user', JSON.stringify({
                name: 'CxC Agent',
                id: '123456',
                role: 'Asisten BCC Divisi CXC'
            }))
            router.push('/dashboard')
        } else {
            alert('Username atau password salah!')
        }
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-lg">
                        BNI
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">CX Communication</h2>
                <p className="text-gray-600">Login to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                    </label>
                    <input
                        type="text"
                        value={credentials.username}
                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Login
                </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
                <p>Demo: username: admin, password: password</p>
            </div>
        </div>
    )
}