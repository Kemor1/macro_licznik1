import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Sprawdź czy klucz istnieje
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza GOOGLE_API_KEY w pliku .env" },
        { status: 500 }
      );
    }

    // 2. Pobierz obrazek z requestu (frontend wysyła JSON z polem 'image')
    const body = await req.json();
    const { image } = body; // To jest base64 string

    if (!image) {
      return NextResponse.json(
        { error: "Nie przesłano obrazka" },
        { status: 400 }
      );
    }

    // 3. Konfiguracja Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    //const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. Przygotuj prompt i dane
    // Gemini wymaga usunięcia prefiksu "data:image/jpeg;base64," jeśli tam jest
    const base64Data = image.split(",")[1] || image;

    const prompt = `
      Jesteś dietetykiem. Przeanalizuj to zdjęcie jedzenia.
      Zwróć TYLKO czysty obiekt JSON (bez markdown, bez '''json).
      Format:
      {
        "name": "nazwa potrawy po polsku",
        "calories": liczba_kalorii (number),
        "protein": gramy_bialka (number),
        "carbs": gramy_wegli (number),
        "fat": gramy_tluszczu (number)
      }
      Jeśli na zdjęciu nie ma jedzenia, zwróć JSON z polami wyzerowanymi i nazwą "Nie rozpoznano jedzenia".
    `;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg", // Zakładamy jpeg, ale flash radzi sobie też z png
      },
    };

    // 5. Wyślij do Google
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // 6. Wyczyść odpowiedź (czasami AI dodaje ```json na początku)
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanText);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Błąd API:", error);
    return NextResponse.json(
      { error: "Błąd podczas analizy zdjęcia." },
      { status: 500 }
    );
  }
}

// test deplay