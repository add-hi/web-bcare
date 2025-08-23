import { Toaster } from 'react-hot-toast'
import ClientInit from './ClientInit'
import './globals.css'

export const metadata = {
  title: 'B-Care Dashboard',
  description: 'Customer Experience Communication System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientInit />
        {children}
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  )
}