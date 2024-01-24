import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Student Center',
  description: 'better student center fr',
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
