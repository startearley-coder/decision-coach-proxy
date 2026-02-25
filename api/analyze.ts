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
            content: `You are an expert decision coach. Analyze the user's inputs and return a strict JSON object. You MUST use this exact schema to ensure all React UI bindings are hit.

CRITICAL RULE: For ALL option titles, you MUST use the EXACT, full, verbatim string the user provided. Do not summarize or shorten it.

{
  "goalInterpretation": "A concise paragraph interpreting their desired outcome.",
  "keyConstraints": "A single, synthesized paragraph of text summarizing their constraints.",
  "regretRisk": "Analysis of their biggest fear.",
  "balancedRecommendation": {
    "suggestedDirection": "Exact name of the best option",
    "recommendationDirection": "Exact name of the best option",
    "direction": "Exact name of the best option",
    "suggestion": "Exact name of the best option",
    "confidence": 85,
    "confidencePercent": 85,
    "confidenceScore": 85,
    "preparationStep": "A practical next action step."
  },
  "optionComparison": [
    {
      "option": "Exact FULL string of the option",
      "optionText": "Exact FULL string of the option",
      "optionName": "Exact FULL string of the option",
      "title": "Exact FULL string of the option",
      "name": "Exact FULL string of the option",
      "label": "Exact FULL string of the option",
      "bestPercent": 40,
      "likelyPercent": 40,
      "worstPercent": 20
    }
  ],
  "recommendation_direction": "Exact name of the best option",
  "confidence_percent": 85,
  "report_text": "Combine regret risk and preparation step here."
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
