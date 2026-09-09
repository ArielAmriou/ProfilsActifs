"use client";

import { useEffect, useState, type ChangeEvent } from "react";

interface FrenchDateInputProps {
  id: string;
  name: string;
  value: string; // YYYY-MM-DD (stockage / API)
  onChange: (isoDate: string) => void;
  className?: string;
  required?: boolean;
  autoComplete?: string;
}

/** Affiche et saisit une date en JJ/MM/AAAA, émet YYYY-MM-DD. */
export function FrenchDateInput({
  id,
  name,
  value,
  onChange,
  className = "",
  required = false,
  autoComplete,
}: FrenchDateInputProps) {
  const [display, setDisplay] = useState(() => isoToDisplay(value));

  useEffect(() => {
    setDisplay(isoToDisplay(value));
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDisplay = formatTyping(event.target.value);
    setDisplay(nextDisplay);

    if (nextDisplay.length === 0) {
      onChange("");
      return;
    }

    const iso = displayToIso(nextDisplay);
    onChange(iso ?? "");
  };

  const isComplete = display.length === 10;
  const isInvalid = isComplete && !displayToIso(display);

  return (
    <>
      <input
        id={id}
        name={`${name}-display`}
        type="text"
        inputMode="numeric"
        autoComplete={autoComplete}
        required={required}
        placeholder="JJ/MM/AAAA"
        value={display}
        onChange={handleChange}
        className={className}
        aria-invalid={isInvalid || undefined}
        aria-describedby={isInvalid ? `${id}-error` : undefined}
      />
      <input type="hidden" name={name} value={value} readOnly />
      {isInvalid && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-action">
          Date invalide. Utilisez le format JJ/MM/AAAA.
        </p>
      )}
    </>
  );
}

function isoToDisplay(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function displayToIso(display: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
    return null;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** N'autorise que des chiffres et insère les `/` au fur et à mesure. */
function formatTyping(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
