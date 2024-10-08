const pickHeaders = (headers: Headers, keys: (string | RegExp)[]): Headers => {
  const picked = new Headers();
  for (const key of headers.keys()) {
    if (keys.some((k) => (typeof k === "string" ? k === key : k.test(key)))) {
      const value = headers.get(key);
      if (typeof value === "string") {
        picked.set(key, value);
      }
    }
  }
  return picked;
};

const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization, OpenAI-Beta", // Include OpenAI-Beta here
};

export default async function handleRequest(req: Request & { nextUrl?: URL }) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }

  const { pathname, search } = req.nextUrl ? req.nextUrl : new URL(req.url);
  const url = new URL(pathname + search, "https://api.openai.com").href;

  // Update the keys array to include 'OpenAI-Beta'
  const headers = pickHeaders(req.headers, ["content-type", "authorization", /OpenAI-Beta/i]);

  console.log("Request URL:", url);
  console.log("Request Headers:", Array.from(headers.entries()));

  const res = await fetch(url, {
    body: req.body,
    method: req.method,
    headers,
  });

  console.log("Response Status:", res.status);
  console.log("Response Headers:", Array.from(res.headers.entries()));

  const resHeaders = {
    ...CORS_HEADERS,
    ...Object.fromEntries(
      pickHeaders(res.headers, ["content-type", /^x-ratelimit-/, /^openai-/])
    ),
  };

  return new Response(res.body, {
    headers: resHeaders,
    status: res.status
  });
}


// this to allow all headers, can be seen on vecel

// const pickHeaders = (headers: Headers): Headers => {
//   const picked = new Headers();
//   for (const key of headers.keys()) {
//     const value = headers.get(key);
//     if (typeof value === "string") {
//       picked.set(key, value);
//     }
//   }
//   return picked;
// };

// const CORS_HEADERS: Record<string, string> = {
//   "access-control-allow-origin": "*",
//   "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "access-control-allow-headers": "*", // Allow all headers
// };

// export default async function handleRequest(req: Request & { nextUrl?: URL }) {
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       headers: CORS_HEADERS,
//     });
//   }

//   const { pathname, search } = req.nextUrl ? req.nextUrl : new URL(req.url);
//   const url = new URL(pathname + search, "https://api.openai.com").href;

//   // Pick all headers
//   const headers = pickHeaders(req.headers);

//   console.log("Request URL:", url);
//   console.log("Request Headers:", Array.from(headers.entries()));

//   const res = await fetch(url, {
//     body: req.body,
//     method: req.method,
//     headers,
//   });

//   console.log("Response Status:", res.status);
//   console.log("Response Headers:", Array.from(res.headers.entries()));

//   const resHeaders = {
//     ...CORS_HEADERS,
//     ...Object.fromEntries(
//       pickHeaders(res.headers)
//     ),
//   };

//   return new Response(res.body, {
//     headers: resHeaders,
//     status: res.status
//   });
// }
