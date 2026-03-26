import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

import "katex/dist/katex.min.css"

export default function MarkdownViewer({ content }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ inline, className, children }) {
  const match = /language-(\w+)/.exec(className || "")

  if (!inline && match) {
    return (
      <CodeBlock
        language={match[1]}
        value={String(children)}
      />
    )
  }

  return <code>{children}</code>
}
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function CodeBlock({ language, value }) {
  const copyCode = () => {
    navigator.clipboard.writeText(value)
  }

  return (
    <div className="code-block">
      <button onClick={copyCode} className="copy-btn">
        Copy
      </button>

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}