import { Clapperboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Indiaflix home">
        <span className="brand-mark"><Clapperboard size={21} strokeWidth={2.4} /></span>
        <span>INDIA<span className="brand-accent">FLIX</span></span>
      </a>
      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav className={menuOpen ? 'nav-links nav-links-open' : 'nav-links'}>
        <a href="#plans" onClick={() => setMenuOpen(false)}>Plans</a>
        <a href="#compare" onClick={() => setMenuOpen(false)}>Compare</a>
        <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        <a className="nav-cta" href="#plans" onClick={() => setMenuOpen(false)}>Explore plans <span>↗</span></a>
      </nav>
    </header>
  );
}