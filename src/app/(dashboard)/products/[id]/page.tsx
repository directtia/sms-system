'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { extractVariables } from '@/lib/interpolate'

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [variables, setVariables] = useState<string[]>([])
  const [preview, setPreview] = useState('')

  useEffect(() => {
    fetchProductAndTemplate()
  }, [productId])

  useEffect(() => {
    // Extract variables from message
    const extracted = extractVariables(message)
    setVariables(extracted)

    // Generate preview
    let previewText = message
    extracted.forEach(variable => {
      previewText = previewText.replace(new RegExp(`{{\\s*${variable}\\s*}}`, 'g'), `[${variable}]`)
    })
    setPreview(previewText)
  }, [message])

  const fetchProductAndTemplate = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/products/${productId}/template`)

      if (res.status === 404) {
        // No template yet - fetch product only
        setMessage('')
        setVariables([])
      } else if (!res.ok) {
        throw new Error('Failed to fetch template')
      } else {
        const data = await res.json()
        setMessage(data.template?.message || '')
        setVariables(data.template?.variables || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      alert('A mensagem não pode estar vazia')
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`/api/products/${productId}/template`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          variables
        })
      })

      if (!res.ok) throw new Error('Failed to save template')

      alert('Template salvo com sucesso!')
      router.push('/products')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving template')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Editar Template</h1>
        <a
          href="/products"
          className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800"
        >
          ← Voltar
        </a>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Mensagem Template
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Use {`{{variável}}`} para adicionar variáveis dinâmicas.
            <br />
            Exemplo: Olá {`{{customer_name}}`}, seu código é {`{{code}}`}
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite a mensagem de SMS..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            disabled={saving}
          />
        </div>

        {variables.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Variáveis Detectadas
            </label>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <span
                  key={variable}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {`{{${variable}}}`}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              O N8N precisa enviar esses campos para cada lead
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Preview da Mensagem
          </label>
          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm">{preview || '(sua mensagem aparecerá aqui)'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || !message.trim()}
            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Template'}
          </button>
          <a
            href="/products"
            className="bg-slate-700 text-white px-6 py-2 rounded hover:bg-slate-800"
          >
            Cancelar
          </a>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <h3 className="font-bold text-blue-900 mb-2">Como usar com N8N</h3>
        <p className="text-sm text-blue-800">
          1. Configure os leads com os campos: {variables.length > 0 ? variables.join(', ') : 'phone, e variáveis customizadas'}<br/>
          2. Envie para: POST /api/webhooks/n8n<br/>
          3. Payload: <code>{`{ campaignName: "...", productName: "...", leads: [{ phone: "...", ${variables.join(', ')} }] }`}</code>
        </p>
      </div>
    </div>
  )
}
