import Sidebar from '@/components/Sidebar'
import TabComponent from '@/components/Tab'
import Topbar from '@/components/Topbar'

export default function DashboardLayout({ children }) {

    return (
        <div className="min-h-screen bg-gray-100">
            <Topbar />
            <div className="pt-20">
                <Sidebar />
                <main className="ml-64 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
