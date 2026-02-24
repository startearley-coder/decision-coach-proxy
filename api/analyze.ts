export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Vercel automatically parses the JSON body in Node environments
    const body = req.body;

    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ error: "No valid data received from Mocha" });
    }

    console.log("Received payload from Mocha:", JSON.stringify(body));

    // 3. Forward the data to OpenAI
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // This pulls your secret key from Vercel's Environment Variables
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` 
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" }, // Forces OpenAI to return clean JSON
        messages: [
          {
            role: "system",
            content: "You are an expert decision coach. Analyze the user's decision inputs and return a strict JSON object with your analysis. Ensure the output is formatted cleanly."
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
      console.error("OpenAI API Error:", errorText);
      return res.status(openAiResponse.status).json({ error: "OpenAI API failed", details: errorText });
    }

    // 4. Extract the AI's response and send it back to Mocha
    const data = await openAiResponse.json();
    const aiMessage = data.choices[0].message.content;

    console.log("Successfully generated AI analysis.");
    
    // Mocha is expecting a JSON object, so we parse the AI's stringified JSON
    return res.status(200).json({ analysis: JSON.parse(aiMessage) });

  } catch (error) {
    console.error("Vercel Server Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
