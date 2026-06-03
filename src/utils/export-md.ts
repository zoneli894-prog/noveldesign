import { saveAs } from 'file-saver'
import { htmlToMarkdown } from './html-to-md'
import { typeLabels } from '@/data/seed'
import type { DocNode, InfoboxSnapshot } from '@/types'

function buildFrontmatter(doc: DocNode): string {
  const lines = [
    '---',
    `title: "${doc.title}"`,
    `type: ${doc.type}`,
  ]
  if (doc.tags.length > 0) {
    lines.push(`tags: [${doc.tags.map(t => `"${t}"`).join(', ')}]`)
  }
  lines.push('---')
  return lines.join('\n')
}

function buildInfoboxMd(fields: { key: string; value: string }[]): string {
  if (fields.length === 0) return ''
  const rows = fields.map(f => `| ${f.key} | ${f.value} |`)
  return `| 属性 | 值 |\n|------|----|\n${rows.join('\n')}\n\n`
}

function buildTocMd(nodes: DocNode[], depth: number = 0): string {
  let result = ''
  for (const node of nodes) {
    const indent = '  '.repeat(depth)
    result += `${indent}- [[#${node.title}|${node.title}]]\n`
    if (node.children.length) {
      result += buildTocMd(node.children, depth + 1)
    }
  }
  return result
}

function buildDocMd(
  nodes: DocNode[],
  content: Record<string, string>,
  infoboxData: Record<string, InfoboxSnapshot[]>,
  depth: number = 0,
): string {
  let result = ''

  for (const node of nodes) {
    const heading = '#'.repeat(Math.min(depth + 1, 3))
    result += `${heading} ${node.title}\n\n`

    // 类型标签
    result += `> 类型：${typeLabels[node.type] || node.type}\n\n`

    // Infobox
    const snapshots = infoboxData[node.id]
    if (snapshots && snapshots.length > 0) {
      for (const snap of snapshots) {
        if (snap.year !== '全部') {
          result += `**${snap.year}**\n\n`
        }
        result += buildInfoboxMd(snapshots.length === 1 && snap.year === '全部'
          ? snap.fields
          : snap.fields
        )
      }
    }

    // 正文
    const html = content[node.id] || ''
    if (html) {
      result += htmlToMarkdown(html) + '\n\n'
    }

    // 子文档
    if (node.children.length) {
      result += buildDocMd(node.children, content, infoboxData, depth + 1)
    }
  }

  return result
}

export function exportSingleDocMd(doc: DocNode, html: string, infoboxData: Record<string, InfoboxSnapshot[]>): void {
  let md = buildFrontmatter(doc) + '\n\n'

  // Infobox
  const snapshots = infoboxData[doc.id]
  if (snapshots && snapshots.length > 0) {
    for (const snap of snapshots) {
      if (snapshots.length > 1 && snap.year !== '全部') {
        md += `**${snap.year}**\n\n`
      }
      md += buildInfoboxMd(snap.fields)
    }
  }

  // 正文
  if (html) {
    md += htmlToMarkdown(html) + '\n'
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, `${doc.title}.md`)
}

export function exportAllDocsMd(
  docs: DocNode[],
  content: Record<string, string>,
  infoboxData: Record<string, InfoboxSnapshot[]>,
): void {
  const today = new Date().toISOString().slice(0, 10)

  let md = `---\ntitle: "小说设定文档"\ndate: "${today}"\n---\n\n`
  md += `# 小说设定文档\n\n`
  md += `> 导出时间：${today}\n\n`
  md += `---\n\n`

  // 目录
  md += `## 目录\n\n`
  md += buildTocMd(docs)
  md += `\n---\n\n`

  // 正文
  md += buildDocMd(docs, content, infoboxData)

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  saveAs(blob, `小说设定文档_${today}.md`)
}
