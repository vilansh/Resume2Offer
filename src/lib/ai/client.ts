import OpenAI from 'openai'

const providers = {
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY!,
    model: 'llama-3.3-70b-versatile',
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
    model: 'meta-llama/llama-3.3-70b-instruct:free',
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKey: process.env.GEMINI_API_KEY!,
    model: 'gemini-2.0-flash',
  },
}

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  preferredProvider: 'groq' | 'openrouter' | 'gemini' = 'groq'
): Promise<string> {
  const order = [preferredProvider,
    ...Object.keys(providers).filter(p => p !== preferredProvider)
  ] as Array<keyof typeof providers>

  for (const providerKey of order) {
    const provider = providers[providerKey]

    if (!provider.apiKey) continue

    try {
      const client = new OpenAI({
        baseURL: provider.baseURL,
        apiKey: provider.apiKey,
        defaultHeaders: providerKey === 'openrouter' ? {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://resume2offer.com',
          'X-Title': 'Resume2Offer',
        } : undefined,
      })

      const response = await client.chat.completions.create({
        model: provider.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('Empty response')

      console.log(`✅ AI response from: ${providerKey}`)
      return content

    } catch (err) {
      console.warn(`⚠️ Provider ${providerKey} failed:`, err)
      continue
    }
  }

  throw new Error('All AI providers failed. Check your API keys.')
}