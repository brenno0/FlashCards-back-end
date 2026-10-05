export interface LinkMetadata {
  title?: string;
  description?: string;
  faviconUrl?: string;
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const decodeEntities = (value: string) =>
  value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code =
        entity[1].toLowerCase() === 'x'
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });

const clean = (value: string | undefined, max: number) => {
  if (!value) {
    return undefined;
  }
  const text = decodeEntities(value).replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, max) : undefined;
};

const attr = (tag: string, name: string) =>
  tag
    .match(
      new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'),
    )
    ?.slice(2)
    .find((value) => value !== undefined);

const toHttpUrl = (value: string | undefined, base: string) => {
  if (!value) {
    return undefined;
  }
  try {
    const url = new URL(decodeEntities(value.trim()), base);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString().slice(0, 2048)
      : undefined;
  } catch {
    return undefined;
  }
};

/** Extracts title, description and favicon from page HTML (regex over <head>, no DOM). */
export const parseMetadata = (html: string, pageUrl: string): LinkMetadata => {
  const head = html.slice(
    0,
    html.search(/<\/head>/i) >= 0 ? html.search(/<\/head>/i) : html.length,
  );
  const metas = head.match(/<meta\b[^>]*>/gi) ?? [];
  const links = head.match(/<link\b[^>]*>/gi) ?? [];

  const meta = (...keys: string[]) => {
    for (const key of keys) {
      const tag = metas.find(
        (candidate) =>
          (
            attr(candidate, 'property') ?? attr(candidate, 'name')
          )?.toLowerCase() === key,
      );
      const content = tag && attr(tag, 'content');
      if (content) {
        return content;
      }
    }
    return undefined;
  };

  const titleTag = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const iconTag = links.find((tag) =>
    /(^|\s)(icon|shortcut icon|apple-touch-icon)(\s|$)/i.test(
      attr(tag, 'rel') ?? '',
    ),
  );

  return {
    title: clean(meta('og:title', 'twitter:title') ?? titleTag, 500),
    description: clean(
      meta('og:description', 'twitter:description', 'description'),
      2000,
    ),
    faviconUrl:
      toHttpUrl(iconTag && attr(iconTag, 'href'), pageUrl) ??
      toHttpUrl('/favicon.ico', pageUrl),
  };
};
