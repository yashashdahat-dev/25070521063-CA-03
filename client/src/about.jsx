import React from 'react';
import Footer from './homeComp/footer';
import './App.css';

const About = () => {
  const societies = [
    { name: 'ACM Student Chapter', icon: 'fa-code', members: '450+ Members', lead: 'Tech & Algorithm Track' },
    { name: 'Google Developer Student Club', icon: 'fa-brands fa-google', members: '620+ Members', lead: 'Cloud, Web & AI' },
    { name: 'Robotics & Mechatronics Society', icon: 'fa-robot', members: '280+ Members', lead: 'Hardware & Automation' },
    { name: 'Cyber Defense Cell', icon: 'fa-shield-halved', members: '190+ Members', lead: 'Security & Forensics' }
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* Banner */}
        <div className="text-center mb-5">
          <span className="event-category-tag">Institution Overview</span>
          <h1 style={{ fontSize: '2.8rem', marginTop: '6px' }}>
            Empowering Future <span className="gradient-text">Engineers & Creators</span>
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '680px', margin: '1rem auto 0', lineHeight: 1.6 }}>
            SIT Nexus serves as the technological backbone for student initiatives, hackathons, and research showcases, 
            bridging academic theory with competitive industry challenges.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <div className="stat-card" style={{ textAlign: 'left', padding: '2rem' }}>
            <div style={{ color: '#6366f1', fontSize: '1.8rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-compass"></i>
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Our Mission</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Cultivate an inclusive competitive coding culture, foster interdisciplinary collaboration, 
              and provide students with experiential learning opportunities through sponsored technical hackathons.
            </p>
          </div>

          <div className="stat-card" style={{ textAlign: 'left', padding: '2rem' }}>
            <div style={{ color: '#ec4899', fontSize: '1.8rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-eye"></i>
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>Our Vision</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Position SIT among the premier student innovation ecosystems in the country, with student-built 
              prototypes translating into viable startup ventures and patent publications.
            </p>
          </div>
        </div>

        {/* Active Societies Grid */}
        <div className="mb-5">
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Recognized Student Chapters & Societies
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {societies.map((s, i) => (
              <div key={i} className="stat-card" style={{ textAlign: 'left', padding: '1.5rem' }}>
                <i className={`fa-solid ${s.icon}`} style={{ fontSize: '1.5rem', color: '#818cf8', marginBottom: '0.75rem', display: 'block' }}></i>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{s.name}</h4>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>{s.lead}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>{s.members}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CA-03 Project Details Note */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '16px', padding: '1.75rem', marginBottom: '4rem'
        }}>
          <h4 style={{ color: '#a5b4fc', marginBottom: '8px', fontSize: '1.15rem' }}>
            <i className="fa-solid fa-code"></i> Continuous Assessment Note (SIT-CA-03)
          </h4>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            Developed by <strong>Yashash Dahat</strong> (Roll No: <code>25070521063</code>). The system integrates a decoupled React client with a RESTful Express backend connected to MongoDB, complying with the modular project architecture standards defined for CA-03.
          </p>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default About;
