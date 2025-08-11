import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Topbar />
            <div> {/* Added pt-20 to account for fixed topbar */}
                <Sidebar />
                <main className="p-6"> {/* Added ml-64 to account for fixed sidebar width */}
                    {children}
                </main>
            </div>
        </div>
    )
}