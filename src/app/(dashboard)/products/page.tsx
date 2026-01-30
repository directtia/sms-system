'use client'

import { useEffect, useState } from 'react'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newProductName, setNewProductName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProductName.trim()) return

    try {
      setCreating(true)
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProductName })
      })

      if (!res.ok) throw new Error('Failed to create product')

      const data = await res.json()
      setProducts([data.product, ...products])
      setNewProductName('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating product')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Produtos & Templates</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {/* Create Product Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Novo Produto</h2>
        <form onSubmit={handleCreateProduct} className="flex gap-2">
          <input
            type="text"
            placeholder="Nome do produto (ex: iPhone 15)"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !newProductName.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Criando...' : 'Criar'}
          </button>
        </form>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum produto criado ainda
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{product.name}</h3>
                <a
                  href={`/products/${product.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Editar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
