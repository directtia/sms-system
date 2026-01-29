interface SendSMSParams {
  to: string
  message: string
}

interface DizparosResponse {
  success: boolean
  reference?: string
  error?: string
}

const DIZPAROS_API_URL = process.env.DIZPAROS_API_URL || 'https://api.dizparos.com/v1'
const DIZPAROS_API_TOKEN = process.env.DIZPAROS_API_TOKEN

if (!DIZPAROS_API_TOKEN) {
  console.warn('DIZPAROS_API_TOKEN not set - SMS will not be sent')
}

export async function sendSMS(params: SendSMSParams): Promise<DizparosResponse> {
  if (!DIZPAROS_API_TOKEN) {
    console.error('DIZPAROS_API_TOKEN not configured')
    return {
      success: false,
      error: 'API token not configured'
    }
  }

  try {
    const response = await fetch(`${DIZPAROS_API_URL}/messaging/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIZPAROS_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'sms',
        details: [
          {
            to: params.to,
            message: params.message,
          }
        ]
      })
    })

    const data = await response.json() as Record<string, any>

    if (!response.ok) {
      console.error('Dizparos API error:', data)
      return {
        success: false,
        error: (data.error as string) || 'Failed to send SMS'
      }
    }

    // Extract reference from response
    // This depends on Dizparos API response format
    const reference = (data.reference || data.id || data.data?.reference) as string | undefined

    return {
      success: true,
      reference
    }
  } catch (error) {
    console.error('Error sending SMS to Dizparos:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function sendBulkSMS(leads: SendSMSParams[]): Promise<DizparosResponse[]> {
  return Promise.all(leads.map(lead => sendSMS(lead)))
}
