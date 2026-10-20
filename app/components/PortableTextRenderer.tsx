import Image from "next/image";
import type { ReactNode } from "react";

// The subset of serialized Lexical nodes this renderer understands
interface LexicalNode {
    type: string;
    children?: LexicalNode[];
    tag?: string;
    listType?: string;
    text?: string;
    format?: number | string;
    fields?: { url?: string };
    value?: { url?: string | null; alt?: string | null } | number;
}

interface LexicalState {
    root: { children: LexicalNode[] };
}

const isLexicalState = (value: unknown): value is LexicalState =>
    typeof value === "object" && value !== null && Array.isArray((value as LexicalState).root?.children);

// Renders Payload CMS Lexical rich text JSON (or plain strings) to React elements
export function PortableTextRenderer({ content }: { content: unknown }) {
    if (!content) return null;

    // Plain string (legacy or simple content)
    if (typeof content === "string") {
        let parsedContent: LexicalState | null = null;
        if (content.trim().startsWith("{")) {
            try {
                const parsed: unknown = JSON.parse(content);
                if (isLexicalState(parsed)) parsedContent = parsed;
            } catch {
                // Not a JSON structure, fall back to string parsing
            }
        }

        if (parsedContent) {
            content = parsedContent;
        } else {
            return (
                <div className="prose-invert max-w-none">
                    {content.split("\n").map((line, i) => (
                        <p key={i} className="mb-4 leading-relaxed text-gray-300">
                            {line}
                        </p>
                    ))}
                </div>
            );
        }
    }

    // Payload Lexical JSON root node
    if (isLexicalState(content)) {
        return <div className="prose-invert max-w-none">{renderLexicalNodes(content.root.children)}</div>;
    }

    return null;
}

function renderLexicalNodes(nodes: LexicalNode[] | undefined): ReactNode {
    if (!nodes) return null;
    return nodes.map((node, i) => renderLexicalNode(node, i));
}

function renderLexicalNode(node: LexicalNode, key: number): ReactNode {
    if (!node) return null;

    switch (node.type) {
        case "paragraph":
            return (
                <p key={key} className="mb-4 leading-relaxed text-gray-300">
                    {renderLexicalNodes(node.children)}
                </p>
            );
        case "heading": {
            const level = node.tag || "h2";
            const className =
                level === "h2"
                    ? "text-2xl font-bold text-lime-400 mt-8 mb-3 uppercase tracking-wide"
                    : "text-xl font-semibold text-lime-300 mt-6 mb-2 uppercase tracking-wide";
            const Tag = (["h1", "h2", "h3", "h4", "h5", "h6"].includes(level) ? level : "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
            return (
                <Tag key={key} className={className}>
                    {renderLexicalNodes(node.children)}
                </Tag>
            );
        }
        case "quote":
            return (
                <blockquote
                    key={key}
                    className="my-4 rounded-r-lg border-l-4 border-lime-500 bg-white/[0.01] py-2 pl-4 pr-2 italic text-gray-400"
                >
                    {renderLexicalNodes(node.children)}
                </blockquote>
            );
        case "list": {
            const Tag = node.listType === "number" ? "ol" : "ul";
            const className =
                node.listType === "number"
                    ? "list-decimal list-inside space-y-1 text-gray-300 mb-4 pl-4"
                    : "list-disc list-inside space-y-1 text-gray-300 mb-4 pl-4";
            return (
                <Tag key={key} className={className}>
                    {renderLexicalNodes(node.children)}
                </Tag>
            );
        }
        case "listitem":
            return <li key={key}>{renderLexicalNodes(node.children)}</li>;
        case "link":
            return (
                <a
                    key={key}
                    href={node.fields?.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lime-400 underline underline-offset-2 transition-colors hover:text-lime-200"
                >
                    {renderLexicalNodes(node.children)}
                </a>
            );
        case "upload": {
            const upload = typeof node.value === "object" ? node.value : null;
            const url = upload?.url;
            if (!url) return null;
            return (
                <div key={key} className="my-6 overflow-hidden rounded-lg border border-white/10">
                    <Image src={url} alt={upload?.alt || ""} width={900} height={500} className="w-full object-cover" />
                </div>
            );
        }
        case "text": {
            const format = Number(node.format) || 0;
            let el: ReactNode = node.text;
            if (format & 1) el = <strong className="font-bold text-white">{el}</strong>;
            if (format & 2) el = <em className="text-lime-200">{el}</em>;
            if (format & 16)
                el = <code className="rounded border border-white/5 bg-white/10 px-1.5 py-0.5 font-mono text-sm text-lime-300">{el}</code>;
            return <span key={key}>{el}</span>;
        }
        default:
            if (node.children) return <span key={key}>{renderLexicalNodes(node.children)}</span>;
            return null;
    }
}
