"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  searchPostalCodes,
  type PostalCodeSuggestion,
} from "@/lib/postal-codes";

interface PostalCodeAutocompleteProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (isValidSelection: boolean) => void;
  className?: string;
  required?: boolean;
}

export function PostalCodeAutocomplete({
  id,
  name = "location",
  value,
  onChange,
  onValidityChange,
  className = "",
  required = false,
}: PostalCodeAutocompleteProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const normalizedValue = value.replace(/\u2014/g, "-");
  const [query, setQuery] = useState(normalizedValue);
  const [suggestions, setSuggestions] = useState<PostalCodeSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState(normalizedValue);
  const [activeIndex, setActiveIndex] = useState(-1);

  const isValidSelection =
    Boolean(normalizedValue.trim()) && normalizedValue === selectedLabel;

  useEffect(() => {
    setQuery(normalizedValue);
    setSelectedLabel(normalizedValue);
  }, [normalizedValue]);

  useEffect(() => {
    onValidityChange?.(isValidSelection);
  }, [isValidSelection, onValidityChange]);

  useEffect(() => {
    const digits = query.replace(/\D/g, "");
    if (digits.length < 2 || query === selectedLabel) {
      setSuggestions([]);
      setLoading(false);
      setFetchError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setFetchError(null);
      void searchPostalCodes(digits, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setOpen(true);
          setActiveIndex(results.length > 0 ? 0 : -1);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setSuggestions([]);
          setFetchError(
            error instanceof Error
              ? error.message
              : "Impossible de charger les codes postaux.",
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, selectedLabel]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectSuggestion = (suggestion: PostalCodeSuggestion) => {
    setQuery(suggestion.label);
    setSelectedLabel(suggestion.label);
    onChange(suggestion.label);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    setFetchError(null);
  };

  const handleInputChange = (next: string) => {
    setQuery(next);
    if (next !== selectedLabel) {
      setSelectedLabel("");
      onChange("");
    }
    setOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const suggestion = suggestions[activeIndex];
      if (suggestion) selectSuggestion(suggestion);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        required={required}
        value={query}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Ex. : 6900…"
        className={className}
      />

      {open && (loading || fetchError || suggestions.length > 0 || query.replace(/\D/g, "").length >= 2) && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-lg border-2 border-border bg-surface shadow-lg"
        >
          {loading && (
            <li className="px-3 py-2 text-sm text-institutional/70" role="presentation">
              Recherche…
            </li>
          )}
          {!loading && fetchError && (
            <li className="px-3 py-2 text-sm text-action" role="presentation">
              {fetchError}
            </li>
          )}
          {!loading && !fetchError && suggestions.length === 0 && (
            <li className="px-3 py-2 text-sm text-institutional/70" role="presentation">
              Aucun code postal trouvé. Continuez à saisir ou corrigez.
            </li>
          )}
          {!loading &&
            suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.postcode}-${suggestion.city}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  className={`font-title w-full px-3 py-2 text-left text-sm transition ${
                    index === activeIndex
                      ? "bg-action/10 text-institutional"
                      : "text-institutional hover:bg-content-bg"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion.label}
                </button>
              </li>
            ))}
        </ul>
      )}

      {!isValidSelection && query.trim() && (
        <p className="mt-1.5 text-xs text-institutional/65">
          Choisissez un code postal dans la liste proposée.
        </p>
      )}
    </div>
  );
}
