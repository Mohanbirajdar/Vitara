import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'VITARA – Personal Health Record Platform',
  description: 'Unify, manage, and take control of your complete medical history with VITARA.',
  keywords: ['health records', 'medical history', 'personal health', 'FHIR', 'medications'],
  authors: [{ name: 'VITARA Health' }],
  openGraph: {
    title: 'VITARA – Personal Health Record Platform',
    description: 'Your unified health record platform',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
