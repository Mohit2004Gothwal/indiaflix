import { Check, Sparkles } from 'lucide-react';
import { formatPrice } from '../services/api.js';

function displayValue(value) {
  if (value === true || value === 'true') return 'Included';
  if (value === false || value == null || value === 'false') return 'Not included';
  return String(value);
}

export default function PlanCard({ plan, index, onChoose }) {
  const featured = index === 1;
  const period = String(plan.billingPeriod || 'month').toLowerCase();
  const periodLabel = period.includes('year') || period.includes('annual') ? 'year' :
    period.includes('week') ? 'week' : period.includes('day') ? 'day' : 'month';

  return (
    <article className={`plan-card ${featured ? 'plan-card-featured' : ''}`}>
      {featured && <div className="popular-ribbon"><Sparkles size={13} /> MOST POPULAR</div>}
      <div className="plan-card-top">
        <p className="plan-eyebrow">{featured ? 'THE FAN FAVORITE' : `INDIAFLIX ${index + 1}`}</p>
        <h3>{plan.name}</h3>
        <p className="plan-description">{plan.description || 'A little more of what you love.'}</p>
        <div className="price-line">
          <span className="price">{formatPrice(plan.price, plan.currency)}</span>
          <span className="price-period">/ {periodLabel}</span>
        </div>
      </div>
      <button className={featured ? 'button button-primary' : 'button button-secondary'} onClick={() => onChoose(plan)} type="button">
        Choose {plan.name}
        <span aria-hidden="true">→</span>
      </button>
      <div className="feature-list-heading">WHAT'S INCLUDED</div>
      <ul className="feature-list">
        {plan.features.length ? plan.features.map((feature, featureIndex) => {
          const included = !['false', 'no', 'not included', '0'].includes(String(feature.value).toLowerCase());
          return (
            <li key={`${feature.name}-${featureIndex}`} className={!included ? 'feature-unavailable' : ''}>
              <span className="feature-icon">{included ? <Check size={15} /> : <span>–</span>}</span>
              <span className="feature-name">{feature.name}</span>
              {feature.value !== true && feature.value !== false && feature.value != null && (
                <span className="feature-value">{displayValue(feature.value)}</span>
              )}
            </li>
          );
        }) : (
          <li><span className="feature-icon"><Check size={15} /></span><span className="feature-name">Plan details available soon</span></li>
        )}
      </ul>
    </article>
  );
}