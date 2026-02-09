import React, { useState, useEffect } from "react";
import '../styles/link-modal.css';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, openInNewTab: boolean) => void;
  selectedText: string;
}

const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  selectedText,
}) => {
  const [url, setUrl] = useState("");
  const [newTab, setNewTab] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setNewTab(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onInsert(url.trim(), newTab);
      onClose();
    }
  };

  return (
    <div className="link-modal-backdrop" onClick={onClose}>
      <div className="link-modal" onClick={(e) => e.stopPropagation()}>
        <div className="link-modal-header">
          <h3>Insert Hyperlink</h3>
          <button className="close-btn" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="link-modal-body">
            <div className="form-group">
              <label htmlFor="display-text">Text </label>
              <input
                id="display-text"
                type="text"
                value={selectedText || "Link text"}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="url-input">Address</label>
              <input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newTab}
                  onChange={() => setNewTab(!newTab)}
                />
                <span>Open link in new tab</span>
              </label>
            </div>
          </div>

          <div className="link-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!url.trim()}
            >
              Insert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkModal;