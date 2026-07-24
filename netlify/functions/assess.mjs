// Netlify Function: securely calls Claude on the server.
// The API key lives in an environment variable (Netlify → Site configuration →
// Environment variables), NEVER in the front-end code the browser downloads.

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Look for the key under any of these variable names, and — importantly —
  // pick whichever value actually looks like an Anthropic key (starts with
  // "sk-ant"). This way a leftover variable holding the wrong token can't
  // override the correct one. Whitespace is trimmed automatically.
  const candidates = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    my_hr_animal: process.env.my_hr_animal,
    MY_HR_ANIMAL: process.env.MY_HR_ANIMAL,
  };
  let key =
    Object.values(candidates).find((v) => v && v.trim().startsWith("sk-ant")) ||
    Object.values(candidates).find(Boolean);
  key = key ? key.trim() : key;

  // Build a safe report of what each variable holds (no full secrets shown).
  const report = Object.entries(candidates)
    .map(([n, v]) =>
      v ? `${n}: len ${v.length}, starts "${v.trim().slice(0, 7)}…"` : `${n}: not set`
    )
    .join(" | ");

  if (!key) {
    return Response.json(
      { error: `No API key variable is set. [${report}]` },
      { status: 500 }
    );
  }

  let prompt;
  try {
    ({ prompt } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Missing prompt." }, { status: 400 });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      // Temporary diagnostic: show which variable was used and what each holds.
      const diag =
        `used a key of length ${key.length} starting "${key.slice(0, 13)}". ` +
        `Variables → ${report}`;
      return Response.json(
        { error: `${data?.error?.message || "API error"} — ${diag}` },
        { status: r.status }
      );
    }
    // Pass Claude's response straight back to the page.
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: "Could not reach the scoring service. Please try again." },
      { status: 502 }
    );
  }
};
