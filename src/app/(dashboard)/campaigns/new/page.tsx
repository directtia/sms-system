'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewCampaignPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [campaignName, setCampaignName] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      if (data.products?.length > 0) {
        setSelectedProductId(data.products[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!campaignName.trim() || !selectedProductId) {
      alert('Preencha todos os campos')
      return
    }

    try {
      setCreating(true)
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName,
          productId: selectedProductId,
          leads: []
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create campaign')
      }

      alert('Campanha criada com sucesso!')
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating campaign')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando produtos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nova Campanha</h1>
        <a
          href="/"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          ← Voltar
        </a>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">
            Nome da Campanha
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Ex: Black Friday 2026"
            disabled={creating}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Produto
          </label>
          {products.length === 0 ? (
            <p className="text-red-600">Nenhum produto disponível. Crie um produto primeiro.</p>
          ) : (
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={creating}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <p className="text-sm text-blue-800">
            💡 Após criar a campanha, você poderá adicionar leads através da webhook do N8N ou manualmente.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={creating || !campaignName.trim() || products.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Criando...' : 'Criar Campanha'}
          </button>
          <a
            href="/"
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
