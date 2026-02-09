/**
 * Utility functions for message and content processing
 */

export interface MessageChange {
  old_msg: string;
  new_msg: string;
}

export interface MessageImage {
  url: string;
  alt?: string;
}

export interface MessageData {
  type: "text" | "change" | "image";
  content?: string;
  change?: MessageChange;
  image?: MessageImage;
}

/**
 * Check if content is HTML markup
 */
export const isHTMLContent = (content: string): boolean => {
  return content.trim().startsWith("<") && content.includes("</");
};

/**
 * Check if content is a JSON-encoded image
 */
export const isImageContent = (content: string): boolean => {
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const parsed = JSON.parse(trimmed);
      return parsed && typeof parsed === "object" && parsed.type === "image";
    }
  } catch {
    return false;
  }
  return false;
};

/**
 * Parse JSON message data if valid
 */
export const parseMessageData = (text: string): MessageData | null => {
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && "type" in parsed) {
        return parsed as MessageData;
      }
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * Filter files based on allowed extensions
 */
export const filterValidFiles = (
  files: File[],
  allowedExtensions: string[]
): File[] => {
  return files.filter((file) => {
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some((ext) => fileName.endsWith(ext));
  });
};

/**
 * Get filename for download with sanitized name
 */
export const getDownloadFilename = (
  originalName: string,
  extension: string = ".png"
): string => {
  return originalName.replace(/[^a-z0-9]/gi, "_").toLowerCase() + extension;
};
