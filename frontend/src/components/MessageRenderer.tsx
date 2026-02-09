import { FC, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { isHTMLContent, parseMessageData } from "../utils/helpers";
import { MARKDOWN_STYLES } from "../utils/markdownStyles";
import "../styles/message-renderer.css";

interface MessageRendererProps {
  content: string;
}

export const MessageRenderer: FC<MessageRendererProps> = ({ content }) => {
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    alt: string;
  } | null>(null);

  // Memoized parsed message data
  const messageData = useMemo(() => parseMessageData(content), [content]);

  // Handle HTML content (for diff viewer triggers)
  if (isHTMLContent(content)) {
    return (
      <div className="message-html-notice">
        <div className="html-notice-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div className="html-notice-text">
          <strong>Content changes proposed</strong>
          <p>Review the suggested changes in the text editor panel</p>
        </div>
      </div>
    );
  }

  // Handle JSON response format
  if (messageData) {
    switch (messageData.type) {
      case "text":
        return (
          <div className="message-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {messageData.content || ""}
            </ReactMarkdown>
          </div>
        );

      case "change":
        return (
          <div className="message-change">
            <div className="change-section old-message">
              <div className="change-label">Old Message:</div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {messageData.change?.old_msg || ""}
              </ReactMarkdown>
            </div>
            <div className="change-divider">→</div>
            <div className="change-section new-message">
              <div className="change-label">New Message:</div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {messageData.change?.new_msg || ""}
              </ReactMarkdown>
            </div>
          </div>
        );

      case "image":
        // Handle both external URLs and local file paths
        const imageSrc = messageData.image?.url || "";
        const resolvedSrc = imageSrc.startsWith("http")
          ? imageSrc
          : imageSrc.startsWith("/src/")
            ? imageSrc
            : `/src/assets/${imageSrc}`;

        return (
          <>
            <div
              className="message-image"
              onClick={() =>
                setPreviewImage({
                  url: resolvedSrc,
                  alt: messageData.image?.alt || "AI generated image",
                })
              }
              style={{ cursor: "pointer" }}
              title="Click to view full size"
            >
              <img
                className="message-image-content"
                src={resolvedSrc}
                alt={messageData.image?.alt || "AI generated image"}
                onError={(e) => {
                  console.error("Image failed to load:", resolvedSrc);
                  (e.target as HTMLImageElement).style.display = "none";
                }}
                onLoad={() => {
                  console.log("Image loaded successfully:", resolvedSrc);
                }}
              />
            </div>
            {previewImage && (
              <ImagePreviewModal
                imageUrl={previewImage.url}
                imageAlt={previewImage.alt}
                onClose={() => setPreviewImage(null)}
              />
            )}
          </>
        );

      default:
        return (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        );
    }
  }

  // Default: render as markdown
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 style={MARKDOWN_STYLES.h1} {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 style={MARKDOWN_STYLES.h2} {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 style={MARKDOWN_STYLES.h3} {...props} />
        ),
        p: ({ node, ...props }) => <p style={MARKDOWN_STYLES.p} {...props} />,
        ul: ({ node, ...props }) => (
          <ul style={MARKDOWN_STYLES.ul} {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol style={MARKDOWN_STYLES.ol} {...props} />
        ),
        li: ({ node, ...props }) => (
          <li style={MARKDOWN_STYLES.li} {...props} />
        ),
        code: ({ node, ...props }) => {
          const isInline = !String(props.className || "").includes("language-");
          return isInline ? (
            <code style={MARKDOWN_STYLES.codeInline} {...props} />
          ) : (
            <code style={MARKDOWN_STYLES.codeBlock} {...props} />
          );
        },
        blockquote: ({ node, ...props }) => (
          <blockquote style={MARKDOWN_STYLES.blockquote} {...props} />
        ),
        a: ({ node, ...props }) => (
          <a
            style={MARKDOWN_STYLES.a}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        strong: ({ node, ...props }) => (
          <strong style={MARKDOWN_STYLES.strong} {...props} />
        ),
        em: ({ node, ...props }) => (
          <em style={{ fontStyle: "italic" }} {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
