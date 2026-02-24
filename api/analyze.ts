// @ts-nocheck
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ error: "No valid data received from Mocha" });
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` 
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" }, 
        messages: [
          {
            role: "system",
            content: `You are an expert decision coach. Analyze the user's decision inputs. You MUST return a strict JSON object matching EXACTLY this schema structure. Do not deviate.

{
  "recommendation": {
    "suggestion": "State the exact name of the single best option they should choose.",
    "considerations": [
      "A single, practical, immediate next step or preparation action they should take."
    ]
  },
  "confidence_percent": 85,
  "goal_interpretation": "A concise paragraph interpreting their desired outcome and underlying needs.",
  "key_constraints": "A summary paragraph of their main constraints (urgency, financial, reversibility, uncertainty).",
  "regret_risk": "A paragraph explaining the biggest emotional or practical risk if they make the wrong choice.",
  "optionComparison": [
    {
      "option": "Name of the option",
      "bestPercent": 40,
      "likelyPercent": 40,
      "worstPercent": 20
    }
  ],
  "recommendation_direction": "Duplicate of the 'suggestion' value above.",
  "report_text": "A combined summary paragraph of the goal, constraints, and risk analysis."
}

Ensure there is an object in the optionComparison array for every option the user provided. The percentages for each option must equal exactly 100.`
          },
          {
            role: "user",
            content: JSON.stringify(body)
          }
        ]
      })
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return res.status(openAiResponse.status).json({ error: "OpenAI API failed", details: errorText });
    }

    const data = await openAiResponse.json();
    const aiMessage = data.choices[0].message.content;
    
    return res.status(200).json({ analysis: JSON.parse(aiMessage) });

  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
