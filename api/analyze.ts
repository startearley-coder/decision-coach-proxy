export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "content-type": "application/json" } }
    );
  }

  const body = await req.json().catch(() => ({}));

  return new Response(
    JSON.stringify({ ok: true, received: body }),
    { status: 200, headers: { "content-type": "application/json" } }
  );
}
