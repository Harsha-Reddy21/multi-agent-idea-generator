import { FC, useCallback } from "react";
import "../styles/image-preview-modal.css";
import { getDownloadFilename } from "../utils/helpers";

interface ImagePreviewModalProps {
  imageUrl: string;
  imageAlt: string;
  onClose: () => void;
}

export const ImagePreviewModal: FC<ImagePreviewModalProps> = ({
  imageUrl,
  imageAlt,
  onClose,
}) => {
  const handleDownload = useCallback(async (): Promise<void> => {
    try {
      // For external URLs, fetch as blob to avoid CORS issues
      if (imageUrl.startsWith("http")) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = getDownloadFilename(imageAlt);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
      } else {
        // For local images, direct download
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = getDownloadFilename(imageAlt);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(imageUrl, "_blank");
    }
  }, [imageUrl, imageAlt]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className="image-preview-overlay" onClick={handleBackdropClick}>
      <div className="image-preview-modal">
        <div className="image-preview-header">
          <span className="image-preview-title">
            {imageAlt || "Image Preview"}
          </span>
          <button
            className="image-preview-close"
            onClick={onClose}
            title="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="image-preview-content">
          <img src={imageUrl} alt={imageAlt} />
        </div>
        <div className="image-preview-footer">
          <button className="image-download-btn" onClick={handleDownload}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
