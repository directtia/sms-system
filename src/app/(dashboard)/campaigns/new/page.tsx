'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewCampaignPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])

  const [campaignName, setCampaignName] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedOfferId, setSelectedOfferId] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, offersRes, templatesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/offers'),
        fetch('/api/templates')
      ])

      if (!productsRes.ok) throw new Error('Failed to fetch products')

      const productsData = await productsRes.json()
      const offersData = offersRes.ok ? await offersRes.json() : { offers: [] }
      const templatesData = templatesRes.ok ? await templatesRes.json() : { templates: [] }

      setProducts(productsData.products || [])
      setOffers(offersData.offers || [])
      setTemplates(templatesData.templates || [])

      if (productsData.products?.length > 0) {
        setSelectedProductId(productsData.products[0].id)
      }
      if (offersData.offers?.length > 0) {
        setSelectedOfferId(offersData.offers[0].id)
      }
      if (templatesData.templates?.length > 0) {
        setSelectedTemplateId(templatesData.templates[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!campaignName.trim() || !selectedProductId || !selectedOfferId || !selectedTemplateId) {
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
          offerId: selectedOfferId,
          templateId: selectedTemplateId,
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

        <div>
          <label className="block text-sm font-medium mb-2">
            Oferta
          </label>
          {offers.length === 0 ? (
            <p className="text-red-600">Nenhuma oferta disponível. Crie uma oferta primeiro.</p>
          ) : (
            <select
              value={selectedOfferId}
              onChange={(e) => setSelectedOfferId(e.target.value)}
              disabled={creating}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {offers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Template de Mensagem
          </label>
          {templates.length === 0 ? (
            <p className="text-red-600">Nenhum template disponível. Crie um template primeiro.</p>
          ) : (
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              disabled={creating}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
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
            disabled={creating || !campaignName.trim() || products.length === 0 || offers.length === 0 || templates.length === 0}
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
