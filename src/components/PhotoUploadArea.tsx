"use client";

import { useCallback, useState, useEffect } from "react";
import { Camera, ImagePlus, Upload } from "lucide-react";

type PhotoUploadAreaProps = {
  onFileChange?: (file: File | null) => void;
};

export function PhotoUploadArea({ onFileChange }: PhotoUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Sprzątanie URL-i przy odmontowaniu (dobre praktyki)
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(
    (file: File | null) => {
      // 1. Logika walidacji i wywołania rodzica (TERAZ NA ZEWNĄTRZ setPreview)
      if (file && !file.type.startsWith("image/")) return;

      // Najpierw informujemy rodzica o zmianie (bezpiecznie)
      if (onFileChange) {
        onFileChange(file);
      }

      // 2. Aktualizacja lokalnego podglądu
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev); // Sprzątamy stary podgląd
        if (!file) return null;
        return URL.createObjectURL(file);
      });
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
            <img
              src={preview}
              alt="Podgląd"
              className="max-h-[260px] w-auto object-contain rounded-xl"
            />
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="mt-3 text-sm text-accent-lime hover:text-accent-lime-bright"
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