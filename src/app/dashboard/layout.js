import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Topbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}