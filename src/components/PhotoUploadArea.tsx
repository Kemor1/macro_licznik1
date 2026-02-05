"use client";

import { useCallback, useState, useEffect } from "react";
import { Camera, ImagePlus, Upload } from "lucide-react";

type PhotoUploadAreaProps = {
  onFileChange?: (file: File | null) => void;
};

// --- FUNKCJA KOMPRESUJĄCA ZDJĘCIA ---
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // Jeśli plik jest mały (poniżej 1MB), nie ruszamy go
    if (file.size < 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024; // Zmniejszamy szerokość do max 1024px
        const scaleSize = MAX_WIDTH / img.width;
        
        // Jeśli zdjęcie jest już mniejsze niż limit, zostawiamy wymiary
        const finalScale = scaleSize < 1 ? scaleSize : 1;
        
        canvas.width = img.width * finalScale;
        canvas.height = img.height * finalScale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Kompresja do JPEG z jakością 70%
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              resolve(file); // W razie błędu zwróć oryginał
            }
          },
          "image/jpeg",
          0.7
        );
      };
    };
  });
};

export function PhotoUploadArea({ onFileChange }: PhotoUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false); // Nowy stan ładowania

  // Sprzątanie URL-i
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(
    async (file: File | null) => {
      if (file && !file.type.startsWith("image/")) return;

      if (!file) {
        onFileChange?.(null);
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        return;
      }

      // 1. Pokazujemy podgląd od razu (oryginał), żeby użytkownik nie czekał
      const objectUrl = URL.createObjectURL(file);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });

      // 2. Włączamy tryb kompresji
      setIsCompressing(true);

      try {
        // 3. Zmniejszamy plik
        const compressedFile = await compressImage(file);
        
        // 4. Wysyłamy zmniejszony plik do rodzica
        onFileChange?.(compressedFile);
      } catch (err) {
        console.error("Błąd kompresji", err);
        // Jak coś pójdzie nie tak, wyślij oryginał
        onFileChange?.(file);
      } finally {
        setIsCompressing(false);
      }
    },
    [onFileChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file ?? null);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const openCamera = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0] ?? null;
      handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return (
    <div className="w-full">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative rounded-2xl border-2 border-dashed min-h-[280px] flex flex-col items-center justify-center
          transition-colors duration-200
          ${
            isDragging
              ? "border-accent-lime bg-accent-lime/10"
              : "border-surface-elevated bg-surface-card hover:border-accent-lime/50"
          }
          ${preview ? "p-2" : "p-6"}
        `}
      >
        {preview ? (
          <>
            <div className="relative">
              <img
                src={preview}
                alt="Podgląd"
                className={`max-h-[260px] w-auto object-contain rounded-xl ${isCompressing ? "opacity-50" : ""}`}
              />
              {isCompressing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs animate-pulse">
                    Przetwarzanie...
                  </div>
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="mt-3 text-sm text-accent-lime hover:text-accent-lime-bright"
              disabled={isCompressing}
            >
              Usuń zdjęcie
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center text-accent-lime mb-4">
              <Upload className="w-12 h-12" strokeWidth={1.5} />
            </div>
            <p className="text-gray-400 text-center text-sm mb-4">
              Przeciągnij zdjęcie posiłku tutaj
            </p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-lime/15 text-accent-lime font-medium text-sm hover:bg-accent-lime/25 transition-colors">
              <ImagePlus className="w-4 h-4" />
              <span>Wybierz plik</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onInputChange}
              />
            </label>
            <span className="text-gray-500 text-xs mt-3">lub</span>
            <button
              type="button"
              onClick={openCamera}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated text-gray-300 font-medium text-sm hover:bg-surface-elevated/80 hover:text-accent-lime transition-colors border border-surface-elevated"
            >
              <Camera className="w-4 h-4" />
              Zrób zdjęcie
            </button>
          </>
        )}
      </div>
    </div>
  );
}