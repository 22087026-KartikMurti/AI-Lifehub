import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log('API Key: ', !!process.env.AI_API_KEY)

    const { input } = await request.json()
    console.log('Received prompt: ', input)

    const promptResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json",
          // "HTTP-Referer": window.location.href,
          "X-Title": "TaskFlow AI"
        },

        body: JSON.stringify({
          "model": "nvidia/nemotron-nano-12b-v2-vl:free",
          "messages": [
            {
              "role": "system",
              "content": `You are a helpful task management assistant. Your job is to help users create tasks from natural language descriptions.

When a user describes what they need to do, extract the following information:
- title: A clear, concise task title
- description: Any additional details (optional)
- dueDate: Extract date/time if mentioned (return in format "YYYY-MM-DD" or "YYYY-MM-DD HH:mm")
- priority: low, medium, or high (infer from urgency words)
- recurring: true if it's a recurring task (like "every day", "every 2 hours")
- recurringInterval: if recurring, describe the interval (e.g., "every 2 hours", "daily")

Respond in this EXACT JSON format with NO markdown, NO preamble, NO backticks:
{"action":"create_task","task":{"title":"Task title","description":"Optional description","dueDate":"2024-12-01","priority":"medium","recurring":false,"recurringInterval":null},"message":"I've created a task to [brief description]"}

OR if you need clarification:
{"action":"clarify","message":"Your question here"}

OR if listing tasks:
{"action":"list","message":"Here are your tasks..."}

Examples:
User: "Drink water every 2 hours"
{"action":"create_task","task":{"title":"Drink water","description":"Stay hydrated","dueDate":null,"priority":"medium","recurring":true,"recurringInterval":"every 2 hours"},"message":"I've created a recurring task to drink water every 2 hours!"}

User: "Review the project proposal by Friday"
{"action":"create_task","task":{"title":"Review project proposal","description":"","dueDate":"2024-11-29","priority":"high","recurringInterval":null},"message":"I've created a high-priority task to review the project proposal by Friday!"}

Current date context: ${new Date().toISOString().split('T')[0]}`,
            },
            { "role": "user", "content": input }
          ]
        })
      })

    if (!promptResponse.ok) {
      throw new Error(`OpenRouter API error: ${promptResponse.status}`)
    }

    const data = await promptResponse.json()
    console.log("Prompt response success!")
    const response = data.choices[0].message.content || 'No response from AI.'
    console.log("Response: ", response)
    return NextResponse.json({ response })

  } catch(error: any) {
    console.error('OpenRouter API error: ', error)
    return NextResponse.json(
      { error: error.message || "Error generating AI response."}, 
      { status: 500 }
    )
  }
}