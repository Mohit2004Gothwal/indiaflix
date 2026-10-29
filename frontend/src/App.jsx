import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, CheckCircle2, CircleHelp, Clapperboard, RefreshCw, ShieldCheck, Sparkles, Tv, Wifi } from 'lucide-react';
import './App.css';
import Navbar from './components/Navbar.jsx';
import PlanCard from './components/PlanCard.jsx';
import FAQ from './components/FAQ.jsx';
import { getPlans, normalizePlans } from './services/api.js';

const trustItems = [
  { icon: Tv, title: 'Made for every screen', text: 'A plan for your kind of watching.' },
  { icon: Wifi, title: 'Your way to stream', text: 'Compare features before you choose.' },
  { icon: ShieldCheck, title: 'Clear plan details', text: 'See pricing and included features upfront.' },
];

export default function App() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadPlans() {
    setLoading(true);
    setError('');
    try {
      const response = await getPlans();
      setPlans(normalizePlans(response));
    } catch (err) {
      setError(err.message || 'Could not load subscription plans.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPlans(); }, []);

  const featureNames = useMemo(() => {
    const names = new Set();
    plans.forEach((plan) => plan.features.forEach((feature) => names.add(feature.name)));
    return [...names];
  }, [plans]);

  function handleChoose(plan) {
    setNotice(`${plan.name} selected. Account and payment flows are not enabled in this phase.`);
    window.setTimeout(() => setNotice(''), 5000);
  }

  return (
    <div className="app-shell" id="home">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <Navbar />

      <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <div className="eyebrow-pill"><span className="status-dot" /> YOUR NEXT WATCH STARTS HERE</div>
            <h1>Stories worth<br />staying in for<span className="headline-period">.</span></h1>
            <p className="hero-description">Big feelings. Brilliant stories. Find the Indiaflix plan that fits your screen time and your budget.</p>
            <div className="hero-actions">
              <a className="button button-primary hero-button" href="#plans">Explore plans <ArrowRight size={17} /></a>
              <a className="text-link" href="#compare">Compare features <ArrowDown size={15} /></a>
            </div>
            <div className="hero-proof"><span className="proof-avatars"><i>I</i><i>F</i><i>+</i></span><span>Find your perfect plan in a few clicks</span></div>
          </div>
          <div className="hero-art" aria-label="Abstract cinematic artwork">
            <div className="poster poster-back"><span>THE<br />UNKNOWN</span><small>A STORY BEYOND</small></div>
            <div className="poster poster-front"><div className="poster-sun" /><div className="poster-mountain" /><div className="poster-title">A WORLD<br /><em>AWAKE</em></div><small>EVERY STORY HAS A HOME</small></div>
            <div className="floating-chip"><Sparkles size={15} /><span>Find your next favorite</span></div>
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          </div>
          <div className="hero-bottom-note"><span>01 / THE INDIAFLIX EXPERIENCE</span><span>SCROLL TO EXPLORE ↓</span></div>
        </section>

        <section className="trust-strip section-wrap" aria-label="Indiaflix benefits">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <div className="trust-item" key={title}><span className="trust-icon"><Icon size={19} /></span><div><h3>{title}</h3><p>{text}</p></div></div>
          ))}
        </section>

        <section className="plans-section section-wrap" id="plans">
          <div className="section-heading">
            <div><p className="section-kicker">SIMPLE. FLEXIBLE. YOURS.</p><h2>Choose your <span>plan.</span></h2></div>
            <p className="section-side-copy">No guesswork. Just the details you need to pick your next chapter.</p>
          </div>

          {notice && <div className="notice" role="status"><CheckCircle2 size={18} />{notice}</div>}
          {loading ? (
            <div className="state-panel"><span className="loader" /><h3>Finding your plans…</h3><p>Fetching the latest options from Indiaflix.</p></div>
          ) : error ? (
            <div className="state-panel error-panel">
              <div className="state-icon"><CircleHelp size={23} /></div><h3>We couldn't load the plans</h3>
              <p>{error}</p>
              <p className="state-hint">Check that the backend is running at <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}</code> and that its CORS settings allow <code>http://localhost:5173</code>.</p>
              <button className="button button-secondary" type="button" onClick={loadPlans}><RefreshCw size={16} /> Try again</button>
            </div>
          ) : plans.length === 0 ? (
            <div className="state-panel"><div className="state-icon"><Clapperboard size={23} /></div><h3>No active plans yet</h3><p>Once an active plan is added in the database, it will appear here automatically.</p></div>
          ) : (
            <div className={`plans-grid plans-count-${Math.min(plans.length, 4)}`}>
              {plans.map((plan, index) => <PlanCard key={plan.id} plan={plan} index={index} onChoose={handleChoose} />)}
            </div>
          )}
          <p className="plans-disclaimer">Prices and features are provided by the Indiaflix API. Plan selection is a UI demo; payment is not processed.</p>
        </section>

        {!loading && !error && plans.length > 0 && featureNames.length > 0 && (
          <section className="comparison-section section-wrap" id="compare">
            <div className="section-heading comparison-heading"><div><p className="section-kicker">THE DETAILS MATTER</p><h2>Side by <span>side.</span></h2></div><p className="section-side-copy">A quick look at what each plan includes.</p></div>
            <div className="comparison-table-wrap">
              <table className="comparison-table">
                <thead><tr><th>Features</th>{plans.map((plan) => <th key={plan.id}>{plan.name}</th>)}</tr></thead>
                <tbody>{featureNames.map((name) => <tr key={name}><th scope="row">{name}</th>{plans.map((plan) => {
                  const item = plan.features.find((feature) => feature.name === name);
                  const value = item?.value;
                  const included = item && !['false', 'no', 'not included', '0'].includes(String(value).toLowerCase());
                  return <td key={plan.id}>{!item || !included ? <span className="comparison-no">—</span> : value === true ? <CheckCircle2 className="comparison-yes" size={18} /> : <span className="comparison-value">{String(value)}</span>}</td>;
                })}</tr>)}</tbody>
              </table>
            </div>
          </section>
        )}

        <section className="closing-banner section-wrap">
          <div className="closing-decoration"><div /><div /><div /></div>
          <div><p className="section-kicker">YOUR COUCH IS CALLING</p><h2>Make tonight<br />a <span>story night.</span></h2><p>Pick the plan that feels right. The next favorite is out there.</p></div>
          <a className="button button-light" href="#plans">Find your plan <ArrowRight size={17} /></a>
        </section>

        <section className="faq-section section-wrap" id="faq">
          <div className="faq-intro"><p className="section-kicker">GOOD TO KNOW</p><h2>A few things,<br /><span>cleared up.</span></h2><p>Have questions about how plans work? Start here.</p></div>
          <FAQ />
        </section>
      </main>

      <footer className="site-footer section-wrap">
        <a className="brand footer-brand" href="#home"><span className="brand-mark"><Clapperboard size={18} /></span><span>INDIA<span className="brand-accent">FLIX</span></span></a>
        <p>Made for stories. Built for your screen.</p>
        <span className="footer-copyright">© {new Date().getFullYear()} Indiaflix · Project demo</span>
      </footer>
    </div>
  );
}