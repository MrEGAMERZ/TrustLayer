/**
 * MarkdownRenderer v2 — line-by-line parser.
 * Groups ALL pipe-lines into a single table block regardless of blank lines between rows.
 */
export default function MarkdownRenderer({ children }) {
  if (!children) return null;
  const blocks = parseBlocks(String(children));
  return (
    <div className="space-y-3 text-gray-200">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}

/** Step 1: Split raw text into typed blocks */
function parseBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let current = null;

  const flush = () => { if (current) { blocks.push(current); current = null; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('|')) {
      // Table line — group regardless of blank lines around it
      if (current?.type !== 'table') { flush(); current = { type: 'table', lines: [] }; }
      current.lines.push(trimmed);
      continue;
    }

    if (trimmed === '') {
      // Blank line: only flush non-table blocks; table blocks survive blank lines
      // unless the NEXT non-blank line is NOT a pipe line
      if (current?.type === 'table') {
        // Look ahead to see if next non-blank is also a table row
        let peek = i + 1;
        while (peek < lines.length && lines[peek].trim() === '') peek++;
        if (peek < lines.length && lines[peek].trim().startsWith('|')) {
          continue; // Stay in table mode — blank was just formatting
        }
      }
      flush();
      continue;
    }

    if (trimmed.startsWith('```')) {
      flush();
      const lang = trimmed.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', lang, code: codeLines.join('\n') });
      continue;
    }

    if (/^#{1,3}\s/.test(trimmed)) {
      flush();
      const level = trimmed.match(/^(#+)/)[1].length;
      blocks.push({ type: 'heading', level, text: trimmed.replace(/^#+\s+/, '') });
      continue;
    }

    if (/^[-*•]\s/.test(trimmed)) {
      if (current?.type !== 'ul') { flush(); current = { type: 'ul', items: [] }; }
      current.items.push(trimmed.replace(/^[-*•]\s+/, ''));
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      if (current?.type !== 'ol') { flush(); current = { type: 'ol', items: [] }; }
      current.items.push(trimmed.replace(/^\d+\.\s+/, ''));
      continue;
    }

    // Regular text
    if (current?.type === 'para') {
      current.text += ' ' + trimmed;
    } else {
      flush();
      current = { type: 'para', text: trimmed };
    }
  }

  flush();
  return blocks;
}

/** Step 2: Render each typed block */
function renderBlock(block, key) {
  switch (block.type) {
    case 'table':  return <MarkdownTable key={key} lines={block.lines} />;
    case 'code':   return (
      <pre key={key} className="bg-black/40 border border-white/10 rounded-xl p-4 overflow-x-auto">
        <code className="text-[12px] text-cyan-300 font-mono whitespace-pre">{block.code}</code>
      </pre>
    );
    case 'heading': {
      const cls = block.level === 1 ? 'text-[18px] font-semibold text-white mt-2'
                : block.level === 2 ? 'text-[16px] font-semibold text-white mt-2'
                : 'text-[14px] font-semibold text-cyan-300 mt-1';
      return <p key={key} className={cls}>{inlineRender(block.text)}</p>;
    }
    case 'ul': return (
      <ul key={key} className="space-y-1 pl-1">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[14px] leading-relaxed">
            <span className="text-cyan-400 mt-1 flex-shrink-0">·</span>
            <span>{inlineRender(item)}</span>
          </li>
        ))}
      </ul>
    );
    case 'ol': return (
      <ol key={key} className="space-y-1 pl-1">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[14px] leading-relaxed">
            <span className="text-cyan-400 font-mono text-[12px] mt-0.5 w-5 flex-shrink-0">{i + 1}.</span>
            <span>{inlineRender(item)}</span>
          </li>
        ))}
      </ol>
    );
    case 'para': return (
      <p key={key} className="text-[14px] leading-relaxed">{inlineRender(block.text)}</p>
    );
    default: return null;
  }
}

/** Table component */
function MarkdownTable({ lines }) {
  const isSeparator = (line) => /^[\|\-\:\s]+$/.test(line);
  const parseRow = (line) =>
    line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);

  const dataLines = lines.filter(l => !isSeparator(l));
  if (dataLines.length === 0) return null;

  const headers = parseRow(dataLines[0]);
  const rows = dataLines.slice(1).map(parseRow);

  if (headers.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.10] my-1 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <table className="w-full text-[13px] border-collapse min-w-max">
        <thead>
          <tr className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border-b border-white/[0.10]">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-cyan-300 whitespace-nowrap tracking-wide text-[12px] uppercase">
                {inlineRender(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={`border-b border-white/[0.05] transition-colors hover:bg-cyan-500/[0.04] ${
                ri % 2 === 1 ? 'bg-white/[0.02]' : ''
              }`}
            >
              {headers.map((_, ci) => (
                <td key={ci} className={`px-4 py-3 leading-relaxed align-top ${ci === 0 ? 'font-medium text-white/90' : 'text-gray-400'}`}>
                  {inlineRender(row[ci] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Inline markdown: **bold**, *italic*, `code`, [citation text] */
function inlineRender(text) {
  if (!text) return '—';
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[([^\]]+)\])/g;
  const parts = [];
  let last = 0, m;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2] !== undefined)
      parts.push(<strong key={m.index} className="font-semibold text-white">{m[2]}</strong>);
    else if (m[3] !== undefined)
      parts.push(<em key={m.index} className="italic text-gray-300">{m[3]}</em>);
    else if (m[4] !== undefined)
      parts.push(<code key={m.index} className="bg-white/[0.08] text-cyan-400 px-1.5 py-0.5 rounded text-[11px] font-mono">{m[4]}</code>);
    else if (m[5] !== undefined)
      parts.push(
        <span key={m.index} className="inline-flex items-center text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/25 text-cyan-400/80 px-1.5 py-0.5 rounded ml-0.5 whitespace-nowrap">
          {m[5]}
        </span>
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}
