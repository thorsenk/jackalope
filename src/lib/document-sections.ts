/** A non-destructive reading projection. The original capture remains authoritative. */
export interface DocumentSection {
  id: string;
  title: string;
  body: string;
}

export function documentSections(raw: string): DocumentSection[] {
  if (!raw.trim()) return [];
  const sections: DocumentSection[] = [];
  let title = "Intent & context";
  let lines: string[] = [];
  function flush() {
    const body = lines.join("\n").trim();
    if (body) sections.push({ id: `section-${sections.length + 1}`, title, body });
    lines = [];
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    const markdown = trimmed.match(/^#{1,4}\s+(.+)$/);
    const caps = trimmed.length > 3 && trimmed.length < 110 && /[A-Z]/.test(trimmed) && trimmed === trimmed.toUpperCase() && !/[.!?]$/.test(trimmed);
    if (markdown || caps) {
      flush();
      title = markdown?.[1] ?? trimmed.toLowerCase().replace(/(^|\s|—\s)(\p{L})/gu, (_, prefix: string, letter: string) => prefix + letter.toUpperCase());
    } else lines.push(line);
  }
  flush();
  const counts = new Map<string, number>();
  for (const section of sections) counts.set(section.title, (counts.get(section.title) ?? 0) + 1);
  const usedIds = new Map<string,number>();
  return sections.map(section => {
    const slug = encodeURIComponent(section.title.trim().toLowerCase());
    // Equal headings use content identity rather than positional order. Editing that
    // content leaves its old question unlinked rather than attaching it elsewhere.
    let hash = 2166136261;
    for (const character of section.body) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
    const base = `section-${slug}${(counts.get(section.title) ?? 0) > 1 ? `-${(hash >>> 0).toString(36)}` : ""}`;
    const occurrence = usedIds.get(base) ?? 0;
    usedIds.set(base, occurrence + 1);
    return {...section, id: occurrence ? `${base}-${occurrence+1}` : base};
  });
}

export function captureWordCount(raw: string) {
  return raw.trim() ? raw.trim().split(/\s+/).length : 0;
}

/** Recover only a unique exact prefix from legacy 120-character concern records. */
export function recoverConcernText(concern: string, raw: string) {
  if (concern.length !== 120) return concern;
  const matches = raw.split(/\n+/).map(line=>line.trim().replace(/^[-•*]\s*/, "")).filter(line=>line.startsWith(concern));
  return matches.length === 1 ? matches[0] : concern;
}
