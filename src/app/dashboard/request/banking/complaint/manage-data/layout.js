import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Tab from '@/components/Tab'
export default function DashboardLayout({ children }) {
    const tabs = [
        { id: "eskalasi", label: "LIST PROGRESS", from: "#fbbf24", to: "#f59e0b", url: "/dashboard/request/banking/complaint" },
        { id: "manage-data", label: "LIST AGENT", from: "#fbbf24", to: "#f59e0b", url: "/dashboard/request/banking/complaint/manage-data" },
      ];
    return (
        <div className="min-h-screen bg-gray-100">
            <Topbar />
            <div className="fixed top-16 left-64 right-0 z-50 mt-2"> 
        <Tab items={tabs} />
      </div>
            <div> {/* Added pt-20 to account for fixed topbar */}
                <Sidebar />
                <main className> {/* Added ml-64 to account for fixed sidebar width */}
                    {children}
                </main>
            </div>
        </div>
    )
}