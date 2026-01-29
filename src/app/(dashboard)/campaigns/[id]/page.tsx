'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function CampaignDetailsPage() {
  const params = useParams()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCampaignAndLeads()
  }, [campaignId])

  const fetchCampaignAndLeads = async () => {
    try {
      setLoading(true)
      const [campaignRes, leadsRes] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}`),
        fetch(`/api/leads?campaignId=${campaignId}`)
      ])

      if (!campaignRes.ok || !leadsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const campaignData = await campaignRes.json()
      const leadsData = await leadsRes.json()

      setCampaign(campaignData.campaign)
      setLeads(leadsData.leads || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId)
    } else {
      newSelected.add(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(leads.map(l => l.id)))
    } else {
      setSelectedLeads(new Set())
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedLeads.size === 0) {
      alert('Selecione pelo menos um lead')
      return
    }

    if (!confirm(`Deletar ${selectedLeads.size} leads?`)) return

    try {
      setDeleting(true)
      const res = await fetch('/api/leads/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: Array.from(selectedLeads)
        })
      })

      if (!res.ok) throw new Error('Failed to delete leads')

      // Refresh data
      setSelectedLeads(new Set())
      await fetchCampaignAndLeads()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting leads')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-gray-100', label: '⏳ Pendente' },
      sent: { color: 'bg-yellow-100', label: '🟡 Enviado' },
      delivered: { color: 'bg-green-100', label: '🟢 Entregue' },
      failed: { color: 'bg-red-100', label: '🔴 Falha' },
      replied: { color: 'bg-blue-100', label: '💬 Respondeu' }
    }
    const badge = badges[status] || badges.pending
    return `<span class="${badge.color} px-2 py-1 rounded text-sm">${badge.label}</span>`
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded">
        Erro: {error}
      </div>
    )
  }

  if (!campaign) {
    return <div>Campanha não encontrada</div>
  }

  const deliveryRate = campaign.total_leads > 0
    ? Math.round((campaign.delivered / campaign.total_leads) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-gray-600">Produto: {campaign.products?.name}</p>
        </div>
        <a
          href="/"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          ← Voltar
        </a>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Total de Leads</div>
          <div className="text-3xl font-bold">{campaign.total_leads}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Entregues</div>
          <div className="text-3xl font-bold text-green-600">{campaign.delivered}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Falhas</div>
          <div className="text-3xl font-bold text-red-600">{campaign.failed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Taxa de Entrega</div>
          <div className="text-3xl font-bold text-blue-600">{deliveryRate}%</div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Leads ({leads.length})</h2>
          {selectedLeads.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deletando...' : `Deletar ${selectedLeads.size}`}
            </button>
          )}
        </div>

        {leads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Nenhum lead</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === leads.length && leads.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="text-left px-6 py-3">Telefone</th>
                  <th className="text-left px-6 py-3">Mensagem</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Resposta</th>
                  <th className="text-left px-6 py-3">Data de Envio</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                      />
                    </td>
                    <td className="px-6 py-3 font-mono text-sm">{lead.fullphone}</td>
                    <td className="px-6 py-3 text-sm max-w-md truncate">
                      {lead.message}
                    </td>
                    <td className="px-6 py-3">
                      <div className={`inline-block px-2 py-1 rounded text-sm ${
                        lead.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        lead.status === 'failed' ? 'bg-red-100 text-red-800' :
                        lead.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'replied' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status === 'pending' && '⏳ Pendente'}
                        {lead.status === 'sent' && '🟡 Enviado'}
                        {lead.status === 'delivered' && '🟢 Entregue'}
                        {lead.status === 'failed' && '🔴 Falha'}
                        {lead.status === 'replied' && '💬 Respondeu'}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm max-w-md truncate">
                      {lead.reply || '-'}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
