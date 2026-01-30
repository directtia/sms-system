'use client'

import { useEffect, useState } from 'react'
import { Campaign } from '@/types/campaign'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)

      // Fetch both campaigns and products in parallel
      const [campaignsRes, productsRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/products')
      ])

      if (!campaignsRes.ok) throw new Error('Failed to fetch campaigns')

      const campaignsData = await campaignsRes.json()
      const productsData = productsRes.ok ? await productsRes.json() : { products: [] }

      const productMap = new Map(
        (productsData.products || []).map((p: any) => [p.id, p.name])
      )

      const campaignsWithProducts = (campaignsData.campaigns || []).map((campaign: any) => ({
        ...campaign,
        product_name: productMap.get(campaign.product_id) || 'N/A'
      }))

      setCampaigns(campaignsWithProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Delete this campaign?')) return
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete campaign')
      setCampaigns(campaigns.filter(c => c.id !== campaignId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting campaign')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campanhas</h1>
        <button
          onClick={() => window.location.href = '/campaigns/new'}
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          + Nova Campanha Manual
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma campanha criada ainda
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="text-left px-6 py-3 text-white font-semibold">Nome</th>
                <th className="text-left px-6 py-3 text-white font-semibold">Produto</th>
                <th className="text-center px-6 py-3 text-white font-semibold">Total Leads</th>
                <th className="text-center px-6 py-3 text-white font-semibold">Entregues</th>
                <th className="text-center px-6 py-3 text-white font-semibold">Falhas</th>
                <th className="text-center px-6 py-3 text-white font-semibold">Taxa %</th>
                <th className="text-left px-6 py-3 text-white font-semibold">Data</th>
                <th className="text-center px-6 py-3 text-white font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const rate = campaign.total_leads > 0
                  ? Math.round((campaign.delivered / campaign.total_leads) * 100)
                  : 0

                return (
                  <tr key={campaign.id} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-3 font-semibold text-white">{campaign.name}</td>
                    <td className="px-6 py-3 text-slate-200">{campaign.product_name || 'N/A'}</td>
                    <td className="px-6 py-3 text-center text-slate-200">{campaign.total_leads}</td>
                    <td className="px-6 py-3 text-center text-emerald-400 font-semibold">
                      {campaign.delivered}
                    </td>
                    <td className="px-6 py-3 text-center text-red-400 font-semibold">
                      {campaign.failed}
                    </td>
                    <td className="px-6 py-3 text-center font-bold text-teal-400">{rate}%</td>
                    <td className="px-6 py-3 text-sm text-slate-300">
                      {new Date(campaign.created_at).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-3 text-center space-x-3">
                      <a
                        href={`/campaigns/${campaign.id}`}
                        className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                      >
                        Ver
                      </a>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="text-red-400 hover:text-red-300 font-medium transition-colors"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
