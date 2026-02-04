"use client";

import { useCallback, useState } from "react";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { PhotoUploadArea } from "@/components/PhotoUploadArea";

type MacroResult = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string | null;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function HomePage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [macro, setMacro] = useState<MacroResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (file: File | null) => {
    setError(null);
    if (!file) {
      setMacro(null);
      return;
    }
    setAnalyzing(true);
    setMacro(null);
    try {
      const imageDataUrl = await fileToDataUrl(file);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageDataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Błąd analizy");
        return;
      }
      setMacro({
        calories: data.calories ?? 0,
        protein: data.protein ?? 0,
        carbs: data.carbs ?? 0,
        fat: data.fat ?? 0,
        description: data.description ?? null,
      });
    } catch {
      setError("Nie udało się połączyć z serwerem");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-surface-dark flex flex-col safe-bottom">
      <header className="pt-12 pb-6 px-5 text-center">
        <h1 className="text-2xl font-bold text-accent-lime tracking-tight">
          Macro Licznik
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Zdjęcie posiłku → Twoje makro
        </p>
      </header>

      <section className="flex-1 px-4 max-w-lg mx-auto w-full">
        <PhotoUploadArea onFileChange={handleFileChange} />
      </section>

      <section className="px-4 pb-8 max-w-lg mx-auto w-full mt-6">
        <h2 className="text-accent-lime font-semibold flex items-center gap-2 mb-3">
          <UtensilsCrossed className="w-5 h-5" />
          <span>Twoje Makro</span>
        </h2>
        <div className="rounded-2xl bg-surface-card border border-surface-elevated p-6 min-h-[140px] flex flex-col items-center justify-center gap-3">
          {analyzing && (
            <p className="text-accent-lime flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Analizuję...
            </p>
          )}
          {!analyzing && error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          {!analyzing && !error && macro && (
            <>
              {macro.description && (
                <p className="text-gray-400 text-sm text-center w-full">
                  {macro.description}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-sm">
                <div className="bg-surface-elevated rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-accent-lime">{macro.calories}</p>
                  <p className="text-xs text-gray-500">kcal</p>
                </div>
                <div className="bg-surface-elevated rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-accent-lime">{macro.protein}</p>
                  <p className="text-xs text-gray-500">Białko (g)</p>
                </div>
                <div className="bg-surface-elevated rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-accent-lime">{macro.carbs}</p>
                  <p className="text-xs text-gray-500">Węgle (g)</p>
                </div>
                <div className="bg-surface-elevated rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-accent-lime">{macro.fat}</p>
                  <p className="text-xs text-gray-500">Tłuszcze (g)</p>
                </div>
              </div>
            </>
          )}
          {!analyzing && !error && !macro && (
            <p className="text-gray-500 text-sm text-center">
              Tutaj pojawią się makroskładniki po analizie zdjęcia
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
