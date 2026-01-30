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
      <body style={{ background: '#0F172A', color: '#E2E8F0' }}>
        <nav className="bg-slate-900 text-white p-4 shadow-lg border-b border-slate-700">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">📱 SMS Dispatcher</h1>
            <div className="space-x-6 flex">
              <a href="/" className="hover:text-teal-400 transition-colors">Campanhas</a>
              <a href="/products" className="hover:text-teal-400 transition-colors">Produtos</a>
              <a href="/offers" className="hover:text-teal-400 transition-colors">Ofertas</a>
              <a href="/templates" className="hover:text-teal-400 transition-colors">Templates</a>
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
