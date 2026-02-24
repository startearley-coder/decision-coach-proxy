export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "content-type": "application/json" } }
    );
  }

  let body;
  try {
    body = await Promise.race([
      req.json(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 10000) // 10 seconds
      )
    ]);
    console.log("Parsed body:", body); // Log the parsed body

    if (!body || Object.keys(body).length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid data received" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Make the external request with a timeout
    const externalPromise = fetch('YOUR_API_URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    // Use the timeout around the external call
    const response = await Promise.race([
      externalPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("External request timed out")), 10000) // Another 10 seconds
      )
    ]);

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const result = await response.json();

    // Return the result back to the client
    return new Response(
      JSON.stringify({ ok: true, received: result }),
      { status: 200, headers: { "content-type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
