/**
 * Export utilities for MindNotes
 */

export function exportToHTML(title: string, htmlContent: string): void {
  const css = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; background: #fff; color: #1a1a2e; line-height: 1.7; }
    h1 { font-size: 2em; font-weight: 700; margin: 0.5em 0 0.3em; }
    h2 { font-size: 1.5em; font-weight: 600; margin: 0.5em 0 0.3em; }
    h3 { font-size: 1.25em; font-weight: 600; margin: 0.5em 0 0.3em; }
    code { background: #e9ecef; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
    pre { background: #f8f9fa; padding: 1em; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 3px solid #3b82f6; padding-left: 1em; margin: 0.5em 0; color: #6c757d; }
    table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
    table td, table th { border: 1px solid #dee2e6; padding: 0.4em 0.8em; }
    table th { background: #f8f9fa; font-weight: 600; }
    img { max-width: 100%; border-radius: 4px; }
    a { color: #3b82f6; }
  `
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
  ${htmlContent}
</body>
</html>`

  const blob = new Blob([fullHTML], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title || 'note'}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToPDF(title: string): void {
  // Use print dialog — CSS handles print styles
  const orig = document.title
  document.title = title || 'MindNotes'
  window.print()
  document.title = orig
}

export async function exportAllToZip(noteContents: Record<string, string>): Promise<void> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const css = `body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; }`

  for (const [path, raw] of Object.entries(noteContents)) {
    if (!raw || !path.endsWith('.md')) continue
    const name = path.split('/').pop()?.replace('.md', '') || 'note'
    // Simple markdown to HTML (basic)
    const htmlBody = raw
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(name)}</title><style>${css}</style></head><body><p>${htmlBody}</p></body></html>`
    zip.file(`${name}.html`, html)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mindnotes-export.zip'
  a.click()
  URL.revokeObjectURL(url)
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
