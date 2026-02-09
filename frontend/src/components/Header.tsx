import { FC } from "react";
import "../styles/header.css";

interface HeaderProps {
  onSubmitReview: () => void;
}

export const Header: FC<HeaderProps> = ({ onSubmitReview }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <span className="logo-text">
              <img
                src="/src/assets/lilly-black-logo.png"
                alt="Attach"
                className="attach-icon"
              />
            </span>
            <span className="logo-subtitle">Smart Product Profile</span>
          </div>
        </div>

        <div className="header-center">
          <nav className="nav-buttons">
            <button className="nav-btn">Overview</button>
            <button className="nav-btn active">Details</button>
          </nav>
        </div>

        <div className="header-right">
          <button className="new-product-btn">+ New product</button>
          <button className="my-products-btn">📊 My products</button>
          <button className="submit-review-btn" onClick={onSubmitReview}>
            Submit for review
          </button>
        </div>
      </div>
    </header>
  );
};
