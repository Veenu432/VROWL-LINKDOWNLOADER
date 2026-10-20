export default async (request) => {
const corsHeaders = {
"Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods": "POST, OPTIONS",
"Access-Control-Allow-Headers": "Content-Type",
"Content-Type": "application/json",
};

if (request.method === "OPTIONS") {
return new Response(null, {
status: 204,
headers: corsHeaders,
});
}

if (request.method !== "POST") {
return new Response(
JSON.stringify({ error: "Please send a POST request." }),
{ status: 405, headers: corsHeaders }
);
}

try {
const body = await request.json();
const link = String(body.url || "").trim();
const platform = String(body.platform || "").toLowerCase();

let parsedUrl;

try {
  parsedUrl = new URL(link);
} catch {
  return new Response(
    JSON.stringify({ error: "Please enter a valid URL." }),
    { status: 400, headers: corsHeaders }
  );
}

if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
  return new Response(
    JSON.stringify({ error: "Only HTTP and HTTPS links are supported." }),
    { status: 400, headers: corsHeaders }
  );
}

const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");

const platforms = {
  youtube: ["youtube.com", "youtu.be", "m.youtube.com"],
  facebook: ["facebook.com", "fb.watch", "m.facebook.com"],
  instagram: ["instagram.com"],
};

const detectedPlatform = Object.entries(platforms).find(
  ([, domains]) =>
    domains.some((domain) => host === domain || host.endsWith("." + domain))
)?.[0];

if (!detectedPlatform) {
  return new Response(
    JSON.stringify({
      error: "Please enter a supported YouTube, Facebook, or Instagram link.",
    }),
    { status: 400, headers: corsHeaders }
  );
}

if (platform && platform !== detectedPlatform) {
  return new Response(
    JSON.stringify({
      error: "The selected platform does not match the submitted link.",
    }),
    { status: 400, headers: corsHeaders }
  );
}

return new Response(
  JSON.stringify({
    success: true,
    platform: detectedPlatform,
    message:
      "Link recognized. Actual media retrieval is not configured yet. Use the platform's permitted download or sharing options for this content.",
  }),
  { status: 200, headers: corsHeaders }
);

} catch {
return new Response(
JSON.stringify({ error: "Unable to process this request." }),
{ status: 400, headers: corsHeaders }
);
}
};
