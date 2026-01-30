'use client'

import { useEffect, useState } from 'react'

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newOfferName, setNewOfferName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/offers')
      if (!res.ok) throw new Error('Failed to fetch offers')
      const data = await res.json()
      setOffers(data.offers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOfferName.trim()) return

    try {
      setCreating(true)
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOfferName })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create offer')
      }

      const data = await res.json()
      setOffers([data.offer, ...offers])
      setNewOfferName('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating offer')
    } finally {
      setCreating(false)
    }
  }

  const handleStartEdit = (offer: any) => {
    setEditingId(offer.id)
    setEditingName(offer.name)
  }

  const handleUpdateOffer = async (id: string) => {
    if (!editingName.trim()) return

    try {
      setUpdating(true)
      const res = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update offer')
      }

      const data = await res.json()
      setOffers(offers.map(o => o.id === id ? data.offer : o))
      setEditingId(null)
      setEditingName('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating offer')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Delete this offer?')) return

    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete offer')
      setOffers(offers.filter(o => o.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting offer')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ofertas</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {/* Create Offer Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Nova Oferta</h2>
        <form onSubmit={handleCreateOffer} className="flex gap-2">
          <input
            type="text"
            placeholder="Nome da oferta (ex: Black Friday 50%)"
            value={newOfferName}
            onChange={(e) => setNewOfferName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            disabled={creating}
          />
          <button
            type="submit"
            disabled={creating || !newOfferName.trim()}
            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {creating ? 'Criando...' : 'Criar'}
          </button>
        </form>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma oferta criada ainda
        </div>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
              <div className="flex-1">
                {editingId === offer.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      disabled={updating}
                    />
                    <button
                      onClick={() => handleUpdateOffer(offer.id)}
                      disabled={updating || !editingName.trim()}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <h3 className="text-xl font-bold">{offer.name}</h3>
                )}
              </div>
              {editingId !== offer.id && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleStartEdit(offer)}
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Deletar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
