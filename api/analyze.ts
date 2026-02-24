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
            content: `You are an expert decision coach. Analyze the user's decision inputs. You MUST return a strict JSON object matching EXACTLY this schema to satisfy both the frontend UI and the backend database:
{
  "goalInterpretation": "A concise interpretation of their desired outcome.",
  "keyConstraints": "A summary paragraph of their constraints (urgency, financial impact, reversibility).",
  "regretRisk": "An explanation of the biggest risk or emotional toll if they make the wrong choice.",
  "balancedRecommendation": {
    "suggestedDirection": "State the exact name of the single best option.",
    "confidence": 85,
    "preparationStep": "A practical next action they should take."
  },
  "optionComparison": [
    {
      "option": "Name of the option",
      "bestPercent": 40,
      "likelyPercent": 40,
      "worstPercent": 20
    }
  ],
  "report_text": "A brief written analysis of the decision.",
  "recommendation_direction": "State the exact name of the single best option (duplicate of suggestedDirection).",
  "confidence_percent": 85
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
