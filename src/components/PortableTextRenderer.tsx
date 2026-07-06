import Image from 'next/image'

// Renders Payload CMS Lexical rich text JSON (or plain strings) to React elements
export function PortableTextRenderer({ content }: { content: any }) {
  if (!content) return null

  // Plain string (legacy or simple content)
  if (typeof content === 'string') {
    let parsedContent = null;
    if (content.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(content);
        if (parsed?.root?.children) {
          parsedContent = parsed;
        }
      } catch (e) {
        // Not a JSON structure, fall back to string parsing
      }
    }

    if (parsedContent) {
      content = parsedContent;
    } else {
      return (
        <div className="prose-invert max-w-none">
          {content.split('\n').map((line, i) => (
            <p key={i} className="text-gray-300 leading-relaxed mb-4">{line}</p>
          ))}
        </div>
      );
    }
  }

  // Payload Lexical JSON root node
  if (content?.root?.children) {
    return (
      <div className="prose-invert max-w-none">
        {renderLexicalNodes(content.root.children)}
      </div>
    )
  }

  return null
}

function renderLexicalNodes(nodes: any[]): React.ReactNode {
  if (!nodes) return null
  return nodes.map((node, i) => renderLexicalNode(node, i))
}

function renderLexicalNode(node: any, key: number): React.ReactNode {
  if (!node) return null

  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key} className="text-gray-300 leading-relaxed mb-4">
          {renderLexicalNodes(node.children)}
        </p>
      )
    case 'heading': {
      const level = node.tag || 'h2'
      const className = level === 'h2'
        ? 'text-2xl font-bold text-lime-400 mt-8 mb-3 uppercase tracking-wide'
        : 'text-xl font-semibold text-lime-300 mt-6 mb-2 uppercase tracking-wide'
      const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      return <Tag key={key} className={className}>{renderLexicalNodes(node.children)}</Tag>
    }
    case 'quote':
      return (
        <blockquote key={key} className="border-l-4 border-lime-500 pl-4 italic text-gray-400 my-4 bg-white/[0.01] py-2 pr-2 rounded-r-lg">
          {renderLexicalNodes(node.children)}
        </blockquote>
      )
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      const className = node.listType === 'number'
        ? 'list-decimal list-inside space-y-1 text-gray-300 mb-4 pl-4'
        : 'list-disc list-inside space-y-1 text-gray-300 mb-4 pl-4'
      return <Tag key={key} className={className}>{renderLexicalNodes(node.children)}</Tag>
    }
    case 'listitem':
      return <li key={key}>{renderLexicalNodes(node.children)}</li>
    case 'link':
      return (
        <a
          key={key}
          href={node.fields?.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lime-400 underline underline-offset-2 hover:text-lime-200 transition-colors"
        >
          {renderLexicalNodes(node.children)}
        </a>
      )
    case 'upload': {
      const url = node.value?.url
      if (!url) return null
      return (
        <div key={key} className="my-6 rounded-lg overflow-hidden border border-white/10">
          <Image src={url} alt={node.value?.alt || ''} width={900} height={500} className="w-full object-cover" />
        </div>
      )
    }
    case 'text': {
      let el: React.ReactNode = node.text
      if (node.format & 1) el = <strong className="text-white font-bold">{el}</strong>
      if (node.format & 2) el = <em className="text-lime-200">{el}</em>
      if (node.format & 16) el = <code className="bg-white/10 text-lime-300 px-1.5 py-0.5 rounded text-sm font-mono border border-white/5">{el}</code>
      return <span key={key}>{el}</span>
    }
    default:
      if (node.children) return <span key={key}>{renderLexicalNodes(node.children)}</span>
      return null
  }
}
