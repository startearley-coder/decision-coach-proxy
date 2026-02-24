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
    if (!body || Object.keys(body).length ===0) 
    {return new response(JSON.sringify({ error:"No valid data recieved"}),
                         {status: 400, headers: {"content-type": "application/json"}
                           );
    } catch (error) { return new response(JSON.stringify({ error: "invalid JSON input"}),
                                          {status: 400, headers: 
                                          {"content-type": "application/jason" } }
                                          );
                    }
  //If we got valid data, return it back.
return new response(JSON.stringify({ ok: true,recieved: body}),
                    {status: 200, headers:
                    {"content-type": "application/json" } }
                    );
}

  

  
  //const body = await req.json().catch(() => ({}));

 // return new Response(
    //JSON.stringify({ ok: true, received: body }),
   // { status: 200, headers: { "content-type": "application/json" } }
  );
}


