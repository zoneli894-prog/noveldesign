const WIKI_LINK_REGEX = /data-target-id="([^"]+)"/g

export function extractWikiLinks(html: string): string[] {
  const links: string[] = []
  let match
  while ((match = WIKI_LINK_REGEX.exec(html)) !== null) {
    links.push(match[1])
  }
  return links
}
