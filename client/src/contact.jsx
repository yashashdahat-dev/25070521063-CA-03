import React, { useState } from 'react';
import Footer from './homeComp/footer';
import './App.css';

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    roll: '25070521063',
    email: '',
    category: 'Registration Issue',
    message: ''
  });

  const faqs = [
    { q: 'Can students from different branches form a hackathon team?', a: 'Yes! Cross-branch collaboration is highly encouraged in all SIT flagship events.' },
    { q: 'Is there any registration fee for campus hackathons?', a: 'All internal college hackathons and coding contests on SIT Nexus are 100% free of charge for enrolled students.' },
    { q: 'How will I receive my team confirmation badge?', a: 'Upon submitting your team details, an official digital team pass is instantly generated with a unique Pass ID that you can present at the venue check-in desk.' },
    { q: 'Will hardware components be provided for robotics challenges?', a: 'Standard development boards and sensor kits will be issued from the Robotics Hardware Lab to shortlisted teams.' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* Header */}
        <div className="text-center mb-5">
          <span className="event-category-tag">Help Desk</span>
          <h1 style={{ fontSize: '2.8rem', marginTop: '6px' }}>
            Event Support & <span className="gradient-text">Coordinator Desk</span>
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '620px', margin: '1rem auto 0' }}>
            Have a question about rules, venue allocations, or technical requirements? Reach out to our organizing team.
          </p>
        </div>

        {/* Content Row */}
        <div className="row mb-5">
          {/* Form */}
          <div className="col-lg-7 mb-4">
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '20px', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Send an Inquiry</h3>

              {formSubmitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <i className="fa-solid fa-paper-plane" style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: '1rem' }}></i>
                  <h4 style={{ color: '#fff' }}>Message Dispatched</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Thank you! The student event coordinator for <strong>{contactData.category}</strong> will get back to your email within 24 hours.
                  </p>
                  <button className="btn-nexus-outline" onClick={() => setFormSubmitted(false)}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label-custom">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control-custom"
                        value={contactData.name}
                        onChange={e => setContactData({ ...contactData, name: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label-custom">Roll Number *</label>
                      <input
                        type="text"
                        required
                        className="form-control-custom"
                        value={contactData.roll}
                        onChange={e => setContactData({ ...contactData, roll: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label-custom">Email *</label>
                      <input
                        type="email"
                        required
                        className="form-control-custom"
                        value={contactData.email}
                        onChange={e => setContactData({ ...contactData, email: e.target.value })}
                        placeholder="you@sit.edu"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label-custom">Inquiry Type</label>
                      <select
                        className="form-control-custom"
                        value={contactData.category}
                        onChange={e => setContactData({ ...contactData, category: e.target.value })}
                      >
                        <option value="Registration Issue">Registration Issue</option>
                        <option value="Hackathon Rules Query">Hackathon Rules Query</option>
                        <option value="Hardware Lab Request">Hardware Lab Request</option>
                        <option value="General Support">General Support</option>
                      </select>
                    </div>
                  </div>

                  <label className="form-label-custom">Message *</label>
                  <textarea
                    rows="4"
                    required
                    className="form-control-custom"
                    placeholder="Describe your issue or question..."
                    value={contactData.message}
                    onChange={e => setContactData({ ...contactData, message: e.target.value })}
                  ></textarea>

                  <button type="submit" className="btn-nexus-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <i className="fa-solid fa-paper-plane"></i> Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Contacts */}
          <div className="col-lg-5">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="stat-card" style={{ textAlign: 'left', padding: '1.5rem' }}>
                <i className="fa-solid fa-location-dot" style={{ color: '#818cf8', fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}></i>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Desk Location</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                  Tech Society Office, 3rd Floor, Computing Sciences Block, SIT Campus.
                </p>
              </div>

              <div className="stat-card" style={{ textAlign: 'left', padding: '1.5rem' }}>
                <i className="fa-solid fa-envelope" style={{ color: '#06b6d4', fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}></i>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Official Email</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                  hackathons@sit.edu &bull; events.cell@sit.edu
                </p>
              </div>

              <div className="stat-card" style={{ textAlign: 'left', padding: '1.5rem' }}>
                <i className="fa-solid fa-clock" style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}></i>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Office Hours</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                  Monday &ndash; Friday: 9:00 AM &ndash; 5:30 PM IST
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div style={{ marginBottom: '4.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '1.75rem' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.25rem' }}>
            {faqs.map((faq, i) => (
              <div key={i} className="stat-card" style={{ textAlign: 'left', padding: '1.5rem' }}>
                <h4 style={{ fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '8px' }}>
                  <i className="fa-solid fa-circle-question" style={{ color: '#818cf8', marginRight: '8px' }}></i>
                  {faq.q}
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Contact;
