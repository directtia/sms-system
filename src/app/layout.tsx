import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SMS Dispatcher - Dizparos',
  description: 'Sistema de Disparos de SMS via Dizparos',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <nav className="bg-blue-600 text-white p-4 shadow">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">📱 SMS Dispatcher</h1>
            <div className="space-x-4">
              <a href="/" className="hover:opacity-80">Campanhas</a>
              <a href="/products" className="hover:opacity-80">Produtos</a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  )
}
