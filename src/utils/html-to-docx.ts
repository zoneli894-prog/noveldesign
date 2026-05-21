import {
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  AlignmentType,
  convertInchesToTwip,
  type ParagraphChild,
  type IRunOptions,
} from 'docx'

const FONT = 'Noto Sans SC'
const FONT_SIZE = 24

function makeTextRun(text: string, opts: Partial<IRunOptions> = {}): TextRun {
  return new TextRun({ text, font: FONT, size: FONT_SIZE, ...opts })
}

function processInlineNodes(
  nodes: NodeListOf<ChildNode>,
  formatting: { bold?: boolean; italics?: boolean } = {},
): (TextRun | ExternalHyperlink)[] {
  const results: (TextRun | ExternalHyperlink)[] = []

  for (const node of Array.from(nodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text) results.push(makeTextRun(text, formatting))
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()

      if (tag === 'a' && el.hasAttribute('data-wiki-link')) {
        results.push(makeTextRun(el.textContent || '', formatting))
        continue
      }

      if (tag === 'strong' || tag === 'b') {
        results.push(...processInlineNodes(el.childNodes, { ...formatting, bold: true }))
      } else if (tag === 'em' || tag === 'i') {
        results.push(...processInlineNodes(el.childNodes, { ...formatting, italics: true }))
      } else if (tag === 'a' && el.getAttribute('href')) {
        const href = el.getAttribute('href')!
        const text = el.textContent || ''
        results.push(
          new ExternalHyperlink({
            children: [makeTextRun(text, { style: 'Hyperlink' })],
            link: href,
          })
        )
      } else if (tag === 'code') {
        results.push(new TextRun({ text: el.textContent || '', font: 'Courier New', size: FONT_SIZE }))
      } else if (tag === 'br') {
        results.push(makeTextRun('', { break: 1 }))
      } else {
        results.push(...processInlineNodes(el.childNodes, formatting))
      }
    }
  }

  return results
}

function processBlockNode(node: Node): Paragraph[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    if (text.trim()) {
      return [new Paragraph({ children: [new TextRun({ text, font: FONT, size: FONT_SIZE })] })]
    }
    return []
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return []

  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()

  switch (tag) {
    case 'h1':
      return [new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: el.textContent || '', font: FONT, bold: true })],
      })]
    case 'h2':
      return [new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: el.textContent || '', font: FONT, bold: true })],
      })]
    case 'h3':
      return [new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: el.textContent || '', font: FONT, bold: true })],
      })]
    case 'p':
      return [new Paragraph({
        children: processInlineNodes(el.childNodes) as ParagraphChild[],
        spacing: { after: 200 },
      })]
    case 'blockquote':
      return [new Paragraph({
        children: processInlineNodes(el.childNodes) as ParagraphChild[],
        indent: { left: convertInchesToTwip(0.5) },
        spacing: { before: 120, after: 120 },
      })]
    case 'pre': {
      const code = el.querySelector('code')
      const text = code ? code.textContent || '' : el.textContent || ''
      return [new Paragraph({
        children: [new TextRun({ text, font: 'Courier New', size: 20 })],
        spacing: { before: 120, after: 120 },
      })]
    }
    case 'ul':
      return Array.from(el.children).flatMap(li => {
        const text = li.textContent || ''
        return [new Paragraph({
          children: [new TextRun({ text: `  •  ${text}`, font: FONT, size: FONT_SIZE })],
          spacing: { after: 80 },
        })]
      })
    case 'ol':
      return Array.from(el.children).flatMap((li, idx) => {
        const text = li.textContent || ''
        return [new Paragraph({
          children: [new TextRun({ text: `  ${idx + 1}.  ${text}`, font: FONT, size: FONT_SIZE })],
          spacing: { after: 80 },
        })]
      })
    case 'li':
      return processBlockNode(el.childNodes[0] || el)
    case 'hr':
      return [new Paragraph({
        children: [new TextRun({ text: '————————————————', font: FONT, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      })]
    case 'br':
      return [new Paragraph({ children: [] })]
    default:
      return processBlockChildren(el)
  }
}

function processBlockChildren(el: HTMLElement): Paragraph[] {
  return Array.from(el.childNodes).flatMap(child => processBlockNode(child))
}

export function htmlToDocxChildren(html: string): Paragraph[] {
  if (!html || !html.trim()) return []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return processBlockChildren(doc.body)
}
