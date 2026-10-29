import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const questions = [
  {
    q: 'Can I change my plan later?',
    a: 'This page displays the plans configured by the Indiaflix team. Plan changes and billing actions will be enabled when account and payment workflows are added.',
  },
  {
    q: 'Where do plan prices and features come from?',
    a: 'Plan information is loaded from the Indiaflix backend API. The admin dashboard will be used to manage plans and feature values.',
  },
  {
    q: 'Does this page process payments?',
    a: 'Not yet. This project phase focuses on subscription plan display and management; payment processing is outside the current scope.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-list">
      {questions.map((item, index) => (
        <section className={`faq-item ${openIndex === index ? 'faq-item-open' : ''}`} key={item.q}>
          <button type="button" className="faq-question" aria-expanded={openIndex === index} onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
            <span>{item.q}</span><ChevronDown size={19} />
          </button>
          {openIndex === index && <p className="faq-answer">{item.a}</p>}
        </section>
      ))}
    </div>
  );
}