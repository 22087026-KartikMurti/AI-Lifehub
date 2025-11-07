import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    //Debugging
    console.log('API Key: ', !!process.env.AI_API_KEY)

    const { prompt } = await request.json()
    console.log('Received prompt: ', prompt)

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
            "role": "user",
            "content": prompt
          }
        ]
      })
    })

    const data = await promptResponse.json()
    console.log("Prompt response success!")

    const response = data.choices[0].message.content || 'No response from AI.'
    return NextResponse.json({ response })

  } catch(error: any) {
    console.error('OpenAI API error: ', error)
    return NextResponse.json(
      { error: error.message ||  "Error generating AI response."}, 
      { status: 500 }
    )
  }
}