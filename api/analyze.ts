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
            content: `You are an elite, ruthless Founder Risk Modeling Engine. You advise early-stage startup founders on high-stakes strategic, operational, and financial decisions. You MUST return a strict JSON object.

Your tone must be authoritative, firm, and economically biased. Do not use soft, empathetic coaching language. Speak entirely in terms of runway, strategic leverage, burn rate, capital efficiency, and survival risk. If an option risks the life of the company, state it bluntly.

CRITICAL RULE 1: For ALL option titles and recommended directions, you MUST use the EXACT, full, verbatim string the user provided. Do not summarize or shorten it.

CRITICAL RULE 2: You MUST use this exact Flat Schema to map to the React frontend. Do NOT nest the recommendation fields.

{
  "goalInterpretation": "Analyze their objective strictly through the lens of Leverage Potential. Does this goal increase strategic asymmetry, or does it just create operational busywork?",
  "keyConstraints": "Synthesize their constraints into a Capital & Execution Friction report. Analyze runway implications, capital drain, and hidden operational complexity.",
  "regretRisk": "Define the 'Survival Risk'. What is the highest probability failure mode that could kill the company?",
  "optionComparison": [
    {
      "optionText": "Exact FULL string of the option exactly as the user typed it.",
      "bestPercent": 40,
      "likelyPercent": 40,
      "worstPercent": 20,
      "rationale": "A brief, 1-sentence reason for these percentages focusing on economic risk."
    }
  ],
  "recommendationDirection": "Exact FULL string of the single best option.",
  "confidencePercent": 85,
  "preparationStep": "Provide a hard, tactical business directive. E.g., 'Model a 13-week cash flow projection'."
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
