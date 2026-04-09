export type SendEmailOptions = {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  sender?: { email: string; name?: string }
}

export async function sendEmail({ to, subject, htmlContent, sender }: SendEmailOptions) {
  const apiKey = process.env.BREVO_API_KEY
  const defaultSender = process.env.BREVO_SENDER || 'caban@arrcsistemas.com.br'

  if (!apiKey) {
    console.error('BREVO_API_KEY não configurada')
    throw new Error('Configuração de e-mail ausente')
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: sender || { email: defaultSender, name: 'CABAN Finance' },
        to,
        subject,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erro Brevo:', errorData)
      throw new Error(errorData.message || 'Falha ao enviar e-mail')
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao enviar e-mail via Brevo:', error)
    throw error
  }
}
