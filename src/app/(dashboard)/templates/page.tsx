'use client'

import { useEffect, useState } from 'react'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', message: '' })
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/templates')
      if (!res.ok) throw new Error('Failed to fetch templates')
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.message.trim()) return

    try {
      setCreating(true)
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create template')
      }

      const data = await res.json()
      setTemplates([data.template, ...templates])
      setFormData({ name: '', message: '' })
      setShowForm(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating template')
    } finally {
      setCreating(false)
    }
  }

  const handleStartEdit = (template: any) => {
    setEditingId(template.id)
    setFormData({ name: template.name, message: template.message })
  }

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !formData.name.trim() || !formData.message.trim()) return

    try {
      setEditing(true)
      const res = await fetch(`/api/templates/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update template')
      }

      const data = await res.json()
      setTemplates(templates.map(t => t.id === editingId ? data.template : t))
      setEditingId(null)
      setFormData({ name: '', message: '' })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating template')
    } finally {
      setEditing(false)
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete template')
      setTemplates(templates.filter(t => t.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting template')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '', message: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Templates de Mensagens</h1>
        {!showForm && !editingId && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            + Novo Template
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {(showForm || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Editar Template' : 'Novo Template'}
          </h2>
          <form onSubmit={editingId ? handleUpdateTemplate : handleCreateTemplate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Boas-vindas"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                disabled={creating || editing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mensagem</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Escreva a mensagem aqui..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                disabled={creating || editing}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating || editing || !formData.name.trim() || !formData.message.trim()}
                className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
              >
                {editing ? 'Salvando...' : creating ? 'Criando...' : editingId ? 'Salvar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-slate-700 text-white px-6 py-2 rounded hover:bg-slate-800"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum template criado ainda
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{template.name}</h3>
                  <div className="mt-3 p-3 bg-gray-100 rounded">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{template.message}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleStartEdit(template)}
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
