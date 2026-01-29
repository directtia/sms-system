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
      const res = await fetch('/api/campaigns')
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-6 py-3">Nome</th>
                <th className="text-left px-6 py-3">Produto</th>
                <th className="text-center px-6 py-3">Total Leads</th>
                <th className="text-center px-6 py-3">Entregues</th>
                <th className="text-center px-6 py-3">Falhas</th>
                <th className="text-center px-6 py-3">Taxa %</th>
                <th className="text-left px-6 py-3">Data</th>
                <th className="text-center px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const rate = campaign.total_leads > 0
                  ? Math.round((campaign.delivered / campaign.total_leads) * 100)
                  : 0

                return (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{campaign.name}</td>
                    <td className="px-6 py-3">{campaign.products?.name || 'N/A'}</td>
                    <td className="px-6 py-3 text-center">{campaign.total_leads}</td>
                    <td className="px-6 py-3 text-center text-green-600">
                      {campaign.delivered}
                    </td>
                    <td className="px-6 py-3 text-center text-red-600">
                      {campaign.failed}
                    </td>
                    <td className="px-6 py-3 text-center font-bold">{rate}%</td>
                    <td className="px-6 py-3 text-sm">
                      {new Date(campaign.created_at).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-3 text-center space-x-2">
                      <a
                        href={`/campaigns/${campaign.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver
                      </a>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        className="text-red-600 hover:underline"
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
