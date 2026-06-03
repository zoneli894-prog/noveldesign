/**
 * HTML → Markdown 转换器
 * 仿照 html-to-docx.ts 的 DOM 遍历模式，输出 Markdown 文本
 */

function processInlineNodes(nodes: NodeListOf<ChildNode>): string {
  let result = ''

  for (const node of Array.from(nodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()

      if (tag === 'a' && el.hasAttribute('data-wiki-link')) {
        // Wiki-link → [[target-title]]
        const title = el.getAttribute('data-target-title') || el.textContent || ''
        result += `[[${title}]]`
      } else if (tag === 'strong' || tag === 'b') {
        result += `**${processInlineNodes(el.childNodes)}**`
      } else if (tag === 'em' || tag === 'i') {
        result += `*${processInlineNodes(el.childNodes)}*`
      } else if (tag === 'code') {
        result += `\`${el.textContent || ''}\``
      } else if (tag === 'a') {
        const href = el.getAttribute('href') || ''
        const text = el.textContent || ''
        result += `[${text}](${href})`
      } else if (tag === 'br') {
        result += '\n'
      } else {
        result += processInlineNodes(el.childNodes)
      }
    }
  }

  return result
}

function processBlockNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    return text.trim() ? text : ''
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()

  switch (tag) {
    case 'h1':
      return `# ${el.textContent || ''}\n\n`
    case 'h2':
      return `## ${el.textContent || ''}\n\n`
    case 'h3':
      return `### ${el.textContent || ''}\n\n`
    case 'p':
      return `${processInlineNodes(el.childNodes)}\n\n`
    case 'blockquote': {
      const inner = processInlineNodes(el.childNodes)
      const lines = inner.split('\n').filter(l => l.trim())
      return lines.map(l => `> ${l}`).join('\n') + '\n\n'
    }
    case 'pre': {
      const code = el.querySelector('code')
      const text = code ? code.textContent || '' : el.textContent || ''
      return `\`\`\`\n${text}\n\`\`\`\n\n`
    }
    case 'ul':
      return Array.from(el.children)
        .map(li => `- ${processInlineNodes(li.childNodes).trim()}`)
        .join('\n') + '\n\n'
    case 'ol':
      return Array.from(el.children)
        .map((li, idx) => `${idx + 1}. ${processInlineNodes(li.childNodes).trim()}`)
        .join('\n') + '\n\n'
    case 'li':
      return processBlockNode(el.childNodes[0] || el)
    case 'hr':
      return `---\n\n`
    case 'br':
      return '\n'
    default:
      return processBlockChildren(el)
  }
}

function processBlockChildren(el: HTMLElement): string {
  return Array.from(el.childNodes)
    .map(child => processBlockNode(child))
    .join('')
}

export function htmlToMarkdown(html: string): string {
  if (!html || !html.trim()) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return processBlockChildren(doc.body).replace(/\n{3,}/g, '\n\n').trim()
}
