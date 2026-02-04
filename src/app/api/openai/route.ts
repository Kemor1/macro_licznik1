import { NextRequest, NextResponse } from "next/server";

/**
 * API Route do bezpiecznego łączenia z OpenAI.
 * Klucz API trzymaj w zmiennej środowiskowej OPENAI_API_KEY (nigdy w kodzie).
 *
 * Przykład wywołania z frontendu:
 *   const res = await fetch('/api/openai', {
 *     method: 'POST',
 *     body: JSON.stringify({ messages: [...] }),
 *   });
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY nie jest ustawiony na serwerze." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { messages, model = "gpt-4o-mini", ...rest } = body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages ?? [],
        ...rest,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: "Błąd OpenAI", details: err },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("OpenAI API error:", e);
    return NextResponse.json(
      { error: "Błąd po stronie serwera" },
      { status: 500 }
    );
  }
}
