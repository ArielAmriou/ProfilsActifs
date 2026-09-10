export interface PostalCodeSuggestion {
  postcode: string;
  city: string;
  label: string;
}

interface LaPosteLine {
  code_postal?: string;
  nom_de_la_commune?: string;
  libelle_d_acheminement?: string;
}

interface LaPosteResponse {
  results?: LaPosteLine[];
}

const LAPOSTE_URL =
  "https://datanova.laposte.fr/data-fair/api/v1/datasets/laposte-hexasmal/lines";

function titleCaseCity(value: string): string {
  return value
    .toLocaleLowerCase("fr-FR")
    .replace(/(^|[\s'-])(\S)/g, (_, sep: string, char: string) => sep + char.toLocaleUpperCase("fr-FR"));
}

/** Recherche des codes postaux FR dont le préfixe correspond à la saisie. */
export async function searchPostalCodes(
  prefix: string,
  signal?: AbortSignal,
): Promise<PostalCodeSuggestion[]> {
  const digits = prefix.replace(/\D/g, "").slice(0, 5);
  if (digits.length < 2) {
    return [];
  }

  const url = new URL(LAPOSTE_URL);
  url.searchParams.set("size", "25");
  url.searchParams.set("select", "code_postal,nom_de_la_commune,libelle_d_acheminement");
  url.searchParams.set("qs", `code_postal:${digits}*`);

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error("Impossible de charger les codes postaux.");
  }

  const data = (await response.json()) as LaPosteResponse;
  const seen = new Set<string>();
  const suggestions: PostalCodeSuggestion[] = [];

  for (const row of data.results ?? []) {
    const postcode = row.code_postal?.trim() ?? "";
    if (!postcode.startsWith(digits)) {
      continue;
    }
    const cityRaw = row.nom_de_la_commune || row.libelle_d_acheminement || "";
    const city = titleCaseCity(cityRaw.trim());
    if (!city) {
      continue;
    }
    const key = `${postcode}|${city.toLocaleLowerCase("fr-FR")}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    suggestions.push({
      postcode,
      city,
      label: `${postcode} - ${city}`,
    });
  }

  return suggestions.sort((a, b) =>
    a.postcode === b.postcode
      ? a.city.localeCompare(b.city, "fr")
      : a.postcode.localeCompare(b.postcode, "fr"),
  );
}
