export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "content-type": "application/json" } }
    );
  }

  let body;
  try {
    body = await req.json();
    console.log("Parsed body:", body); // Log the parsed body
    if (!body || Object.keys(body).length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid data received" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON input" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  // If we got valid data, return it back
  return new Response(
    JSON.stringify({ ok: true, received: body }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}
