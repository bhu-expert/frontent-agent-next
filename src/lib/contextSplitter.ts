import type { ContextBlock } from "@/types/onboarding.types";

const SECTION_PATTERN = /^##\s*(\d+)\.\s*(.+)$/gm;

export function splitContextMd(contextMd: string): ContextBlock[] {
  const matches = Array.from(contextMd.matchAll(SECTION_PATTERN));

  return matches.slice(0, 5).map((match, index) => {
    const sectionStart = match.index ?? 0;
    const contentStart = sectionStart + match[0].length;
    const nextSectionStart = matches[index + 1]?.index ?? contextMd.length;
    const content = contextMd.slice(contentStart, nextSectionStart).trim();

    return {
      context_index: (index + 1) as 1 | 2 | 3 | 4 | 5,
      title: match[2].trim() || `Context ${index + 1}`,
      content,
    };
  });
}
