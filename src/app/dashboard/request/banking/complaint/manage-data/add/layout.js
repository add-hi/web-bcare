import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Tab from '@/components/Tab'
export default function DashboardLayout({ children }) {
    const tabs = [
        { id: "view-data", label: "VIEW DATA", from: "#4ade80", to: "#22c55e", url: "/dashboard/request/banking/complaint/manage-data/add" },
        { id: "attachment", label: "ATTACHMENT", from: "#3b82f6", to: "#2563eb", url: "/input-data" },
        { id: "raise-call", label: "RAISE CALL", from: "#fbbf24", to: "#f59e0b", url: "/report" },
      ];

      

    return (
        <div className="min-h-screen bg-gray-100">
            <Topbar />
            <div className="fixed top-16 left-64 right-0 z-50 mt-2"> 
        <Tab items={tabs} />
      </div>
      
            <div> {/* Added pt-20 to account for fixed topbar */}
                <Sidebar />
                <main className="p-6"> {/* Added ml-64 to account for fixed sidebar width */}
                    {children}
                </main>
            </div>
        </div>
    )
}