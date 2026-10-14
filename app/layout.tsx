import type { Metadata, Viewport } from 'next'
import './globals.css'
import StoreProvider from './StoreProvider'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'GitHub Clone',
  description: 'A GitHub Clone for public repositories.',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
       <StoreProvider>
        {children}
          <Toaster position="top-right"  closeButton />
        </StoreProvider>
      </body>
    </html>
  )
}
