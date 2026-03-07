import './Footer.scss'

import React from 'react'

import logo from '../../assets/logo-with-text.svg'

const Footer: React.FC = () => {
  return (
    <footer className="Footer" role="contentinfo">
      <div className="Footer__inner">
        <img src={logo} alt="Lilly - A Medicine Company" />
      </div>
      <nav className="Footer__links" aria-label="Footer navigation">
        {/* <a href="#" className="Footer__link">
          Link
        </a>
        <a href="#" className="Footer__link">
          Link
        </a>
        <a href="#" className="Footer__link">
          Link
        </a> */}
        <a
          href="https://now.lilly.com/procedure/global-using-ai-responsibly-at-lilly"
          target="_blank"
          rel="noopener noreferrer"
          className="Footer__link"
        >
          Using AI Responsibly at Lilly
        </a>
      </nav>
    </footer>
  )
}

export default Footer
