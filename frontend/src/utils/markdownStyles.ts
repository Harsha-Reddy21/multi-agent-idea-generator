/**
 * Markdown component styling configuration
 */

export const MARKDOWN_STYLES = {
  h1: {
    fontSize: "1.5em",
    fontWeight: "bold",
    marginTop: "0.5em",
    marginBottom: "0.5em",
  },
  h2: {
    fontSize: "1.3em",
    fontWeight: "bold",
    marginTop: "0.5em",
    marginBottom: "0.5em",
  },
  h3: {
    fontSize: "1.1em",
    fontWeight: "bold",
    marginTop: "0.5em",
    marginBottom: "0.5em",
  },
  p: {
    marginTop: "0.5em",
    marginBottom: "0.5em",
    lineHeight: "1.6",
  },
  ul: {
    marginLeft: "1.5em",
    marginTop: "0.5em",
    marginBottom: "0.5em",
  },
  ol: {
    marginLeft: "1.5em",
    marginTop: "0.5em",
    marginBottom: "0.5em",
  },
  li: {
    marginTop: "0.25em",
    marginBottom: "0.25em",
  },
  codeInline: {
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: "2px 6px",
    borderRadius: "3px",
    fontFamily: "monospace",
    fontSize: "0.9em",
  },
  codeBlock: {
    display: "block",
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: "12px",
    borderRadius: "6px",
    fontFamily: "monospace",
    fontSize: "0.9em",
    overflowX: "auto",
    marginTop: "0.5em",
    marginBottom: "0.5em",
  },
  blockquote: {
    borderLeft: "4px solid #d32f2f",
    paddingLeft: "1em",
    marginLeft: "0",
    color: "#666",
    fontStyle: "italic",
  },
  a: {
    color: "#d32f2f",
    textDecoration: "underline",
  },
  strong: {
    fontWeight: "600",
  },
} as const;