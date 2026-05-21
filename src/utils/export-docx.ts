import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Packer,
  AlignmentType,
  type ParagraphChild,
} from 'docx'
import { saveAs } from 'file-saver'
import { htmlToDocxChildren } from './html-to-docx'
import type { DocNode } from '@/types'

function buildTocParagraphs(nodes: DocNode[], depth: number = 0): Paragraph[] {
  const paragraphs: Paragraph[] = []
  for (const node of nodes) {
    const indent = '  '.repeat(depth)
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `${indent}${node.title}`, font: 'Noto Sans SC', size: 22 })],
        spacing: { after: 40 },
      })
    )
    if (node.children.length) {
      paragraphs.push(...buildTocParagraphs(node.children, depth + 1))
    }
  }
  return paragraphs
}

function buildDocParagraphs(
  nodes: DocNode[],
  content: Record<string, string>,
  depth: number = 0,
): (Paragraph | { pageBreakBefore: true })[] {
  const result: (Paragraph | { pageBreakBefore: true })[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const headingLevel = depth === 0
      ? HeadingLevel.HEADING_1
      : depth === 1
        ? HeadingLevel.HEADING_2
        : HeadingLevel.HEADING_3

    if (i > 0) {
      result.push({ pageBreakBefore: true })
    }

    result.push(
      new Paragraph({
        heading: headingLevel,
        children: [new TextRun({ text: node.title, font: 'Noto Sans SC', bold: true })],
      })
    )

    const html = content[node.id] || ''
    result.push(...htmlToDocxChildren(html))

    if (node.children.length) {
      result.push(...buildDocParagraphs(node.children, content, depth + 1))
    }
  }

  return result
}

export async function exportSingleDoc(doc: DocNode, html: string): Promise<void> {
  const children: (Paragraph | Paragraph[])[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: doc.title, font: 'Noto Sans SC', bold: true })],
    }),
    ...htmlToDocxChildren(html),
  ]

  const docObj = new Document({
    sections: [{ children: children.flat() }],
  })

  const blob = await Packer.toBlob(docObj)
  saveAs(blob, `${doc.title}.docx`)
}

export async function exportAllDocs(
  docs: DocNode[],
  content: Record<string, string>,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10)

  const titlePage = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: '小说设定文档', font: 'Noto Sans SC', bold: true })],
    }),
    new Paragraph({
      children: [new TextRun({ text: `导出时间：${today}`, font: 'Noto Sans SC', size: 22, color: '888888' })],
      spacing: { before: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '————————————————', font: 'Noto Sans SC', size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
    }),
  ]

  const toc = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: '目录', font: 'Noto Sans SC', bold: true })],
    }),
    ...buildTocParagraphs(docs),
  ]

  const body = buildDocParagraphs(docs, content)

  const docObj = new Document({
    sections: [
      { children: titlePage },
      { children: toc },
      { children: body as Paragraph[] },
    ],
  })

  const blob = await Packer.toBlob(docObj)
  saveAs(blob, `小说设定文档_${today}.docx`)
}
