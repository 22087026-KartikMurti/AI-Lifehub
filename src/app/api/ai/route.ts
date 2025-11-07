import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log('API Key: ', !!process.env.AI_API_KEY)

    const { prompt } = await request.json()
    console.log('Received prompt: ', prompt)

    const systemPrompt = `You are AI LifeHub, a personal productivity assistant. Help users manage:

1. **Tasks**: Create, update, or list tasks
2. **Habits**: Track daily habits and streaks  
3. **Schedule**: Manage appointments and reminders
4. **Summary**: Provide daily/weekly summaries

When users request actions like "add task", "track habit", or "schedule meeting", provide structured responses that include:
- Clear confirmation of what was understood
- Any follow-up questions needed
- Actionable next steps

Be conversational but focused on productivity. Always ask for clarification if the request is unclear.`

    const promptResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        "model": "nvidia/nemotron-nano-12b-v2-vl:free",
        "messages": [
          {
            "role": "system",
            "content": systemPrompt
          },
          {
            "role": "user",
            "content": prompt
          }
        ]
      })
    })

    if (!promptResponse.ok) {
      throw new Error(`OpenRouter API error: ${promptResponse.status}`)
    }

    const data = await promptResponse.json()
    console.log("Prompt response success!")

    const response = data.choices[0].message.content || 'No response from AI.'
    return NextResponse.json({ response })

  } catch(error: any) {
    console.error('OpenRouter API error: ', error)
    return NextResponse.json(
      { error: error.message || "Error generating AI response."}, 
      { status: 500 }
    )
  }
}