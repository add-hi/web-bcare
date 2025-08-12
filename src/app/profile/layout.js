import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
      {/* Topbar fixed */}
      <Topbar />

      <div className="flex flex-1 pt-16"> {/* flex-1 biar tinggi penuh sisa layar */}
        <Sidebar />
        
        <main className="ml-64 p-6 flex justify-center items-center w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
