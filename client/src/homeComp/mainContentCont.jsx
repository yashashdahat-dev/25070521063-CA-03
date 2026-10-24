import React from 'react';
import '../App.css';

const MainContent = () => {
  const perks = [
    {
      icon: 'fa-trophy',
      color: '#f59e0b',
      title: 'Prize Pools & Grants',
      desc: 'Win from ₹5,00,000+ total semester prize pool plus direct incubation credits from partner tech labs.'
    },
    {
      icon: 'fa-certificate',
      color: '#06b6d4',
      title: 'Verified Digital Badges',
      desc: 'Every registered participant gets an automated digital certificate accredited by SIT Technical Board.'
    },
    {
      icon: 'fa-people-group',
      color: '#10b981',
      title: 'Cross-Branch Team Ups',
      desc: 'Build interdisciplinary teams across CS, AI/ML, Robotics, and Electronics to tackle real-world challenges.'
    },
    {
      icon: 'fa-briefcase',
      color: '#ec4899',
      title: 'Direct Interview Fast-Track',
      desc: 'Top 3 hackathon teams receive fast-track interview opportunities with sponsor industry recruiters.'
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto 5rem', padding: '0 1rem' }}>
      <div className="text-center mb-5">
        <span className="event-category-tag">Why Participate</span>
        <h2 style={{ fontSize: '2.4rem', marginTop: '6px' }}>Accelerate Your Tech Journey</h2>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
          More than just hackathons — it is where SIT creators build, deploy, and launch their careers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        {perks.map((p, idx) => (
          <div key={idx} className="stat-card" style={{ textAlign: 'left', padding: '1.75rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: `rgba(${p.color === '#f59e0b' ? '245,158,11' : p.color === '#06b6d4' ? '6,182,212' : p.color === '#10b981' ? '16,185,129' : '236,72,153'}, 0.15)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: p.color, fontSize: '1.4rem', marginBottom: '1.25rem'
            }}>
              <i className={`fa-solid ${p.icon}`}></i>
            </div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{p.title}</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainContent;
