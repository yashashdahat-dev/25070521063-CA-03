import React, { useState, useEffect } from 'react';
import Footer from './homeComp/footer';
import { initialEvents } from './home';
import './App.css';

const Services = () => {
  const [activeTab, setActiveTab] = useState('passes'); // 'passes', 'events', 'host'
  const [userRoll, setUserRoll] = useState('25070521063');
  const [registrations, setRegistrations] = useState([]);
  const [eventsList, setEventsList] = useState(initialEvents);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Hackathons',
    date: '',
    time: '',
    venue: '',
    prize: '',
    teamSize: '2 - 4 Members',
    desc: ''
  });
  const [newEventSuccess, setNewEventSuccess] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('sit_user_registrations') || '[]');
    // Seed default registration for student if empty
    if (saved.length === 0) {
      const defaultPass = {
        id: 'TICKET-250705',
        eventId: 'evt-1',
        eventTitle: 'HackSIT 2026: 36-Hour National Hackathon',
        eventDate: 'Nov 14 - 16, 2026',
        venue: 'Campus Tech Audi & Computing Labs',
        teamName: 'Team Algorists',
        leaderName: 'Yashash Dahat',
        rollNumber: '25070521063',
        email: 'yashashdahat@sit.edu',
        teamSize: '4',
        registeredAt: 'Oct 24, 2026',
        status: 'Confirmed'
      };
      saved.push(defaultPass);
      localStorage.setItem('sit_user_registrations', JSON.stringify(saved));
    }
    setRegistrations(saved);
  }, []);

  const handleFilterByRoll = () => {
    const saved = JSON.parse(localStorage.getItem('sit_user_registrations') || '[]');
    if (!userRoll.trim()) {
      setRegistrations(saved);
    } else {
      setRegistrations(saved.filter(r => r.rollNumber.toLowerCase().includes(userRoll.toLowerCase())));
    }
  };

  const handleCancelRegistration = (id) => {
    if (window.confirm('Are you sure you want to cancel this event pass?')) {
      const updated = registrations.filter(r => r.id !== id);
      setRegistrations(updated);
      localStorage.setItem('sit_user_registrations', JSON.stringify(updated));
    }
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const created = {
      id: 'evt-' + (eventsList.length + 1),
      ...newEvent,
      badge: 'Open',
      badgeClass: 'badge-open',
      registeredTeams: 0,
      maxTeams: 50,
      organizer: 'Student Technical Cell',
      tags: ['Innovation', 'Campus']
    };
    setEventsList([created, ...eventsList]);
    setNewEventSuccess(true);
    setTimeout(() => {
      setNewEventSuccess(false);
      setActiveTab('events');
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* Title & Tabs */}
        <div className="text-center mb-4">
          <span className="event-category-tag">Student Dashboard</span>
          <h1 style={{ fontSize: '2.6rem', marginTop: '6px' }}>
            Event Hub & <span className="gradient-text">Pass Manager</span>
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            Track your team registrations, manage entry passes, or submit new club events.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="d-flex justify-content-center gap-2 mb-4">
          <button
            className={`tab-btn ${activeTab === 'passes' ? 'active' : ''}`}
            onClick={() => setActiveTab('passes')}
          >
            <i className="fa-solid fa-id-card"></i> My Registered Passes ({registrations.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <i className="fa-solid fa-calendar-days"></i> All Campus Events ({eventsList.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'host' ? 'active' : ''}`}
            onClick={() => setActiveTab('host')}
          >
            <i className="fa-solid fa-plus-circle"></i> Host New Event
          </button>
        </div>

        {/* TAB 1: PASSES */}
        {activeTab === 'passes' && (
          <div>
            {/* Search Roll Number Box */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
              borderRadius: '16px', padding: '1.25rem 1.75rem', marginBottom: '2rem',
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem' }}>Lookup Passes by Roll Number</h4>
                <small style={{ color: '#94a3b8' }}>Filter your registered hackathon passes</small>
              </div>
              <div className="d-flex gap-2" style={{ maxWidth: '380px', width: '100%' }}>
                <input
                  type="text"
                  className="search-input"
                  style={{ padding: '10px 16px' }}
                  placeholder="Enter Roll Number..."
                  value={userRoll}
                  onChange={(e) => setUserRoll(e.target.value)}
                />
                <button className="btn-nexus-primary" onClick={handleFilterByRoll}>
                  Search
                </button>
              </div>
            </div>

            {/* Passes List */}
            {registrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                <i className="fa-solid fa-ticket-simple" style={{ fontSize: '3rem', color: '#64748b', marginBottom: '1rem' }}></i>
                <h3>No Event Passes Found</h3>
                <p style={{ color: '#94a3b8' }}>You have not registered for any events with roll number "{userRoll}".</p>
                <button className="btn-nexus-primary" onClick={() => setActiveTab('events')}>
                  Browse & Register Now
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                {registrations.map((pass) => (
                  <div key={pass.id} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '20px',
                    padding: '1.75rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    position: 'relative'
                  }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge-status badge-live">
                        <i className="fa-solid fa-circle-check"></i> {pass.status}
                      </span>
                      <code style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                        {pass.id}
                      </code>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                      {pass.eventTitle}
                    </h3>

                    <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                      <div><i className="fa-solid fa-users" style={{ color: '#818cf8', width: '20px' }}></i> <strong>Team:</strong> {pass.teamName} ({pass.teamSize} members)</div>
                      <div><i className="fa-solid fa-user-astronaut" style={{ color: '#06b6d4', width: '20px' }}></i> <strong>Leader:</strong> {pass.leaderName}</div>
                      <div><i className="fa-solid fa-id-badge" style={{ color: '#f59e0b', width: '20px' }}></i> <strong>Roll No:</strong> {pass.rollNumber}</div>
                      <div><i className="fa-regular fa-calendar" style={{ color: '#ec4899', width: '20px' }}></i> <strong>Schedule:</strong> {pass.eventDate}</div>
                      <div><i className="fa-solid fa-location-dot" style={{ color: '#10b981', width: '20px' }}></i> <strong>Venue:</strong> {pass.venue}</div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Issued on {pass.registeredAt}
                      </span>
                      <button 
                        onClick={() => handleCancelRegistration(pass.id)}
                        className="btn-nexus-outline" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#f87171' }}
                      >
                        <i className="fa-solid fa-trash-can"></i> Cancel Pass
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL EVENTS */}
        {activeTab === 'events' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            {eventsList.map((evt) => (
              <div key={evt.id} className="event-card">
                <div className="card-body-custom">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="event-category-tag">{evt.category}</span>
                    <span className="badge-status badge-live">{evt.badge}</span>
                  </div>
                  <h3 className="event-card-title">{evt.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{evt.desc}</p>
                  
                  <div className="event-meta-row" style={{ marginTop: 'auto' }}>
                    <span className="meta-item"><i className="fa-regular fa-calendar"></i> {evt.date}</span>
                    <span className="meta-item"><i className="fa-solid fa-award" style={{ color: '#f59e0b' }}></i> {evt.prize}</span>
                  </div>

                  <div className="card-footer-custom" style={{ marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}><i className="fa-solid fa-location-dot"></i> {evt.venue}</span>
                    <a href="/" className="btn-nexus-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                      Register <i className="fa-solid fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: HOST EVENT */}
        {activeTab === 'host' && (
          <div style={{ maxWidth: '640px', margin: '0 auto 4rem', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '20px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Submit a Campus Event</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you a club coordinator or society president? Publish your upcoming hackathon or contest.
            </p>

            {newEventSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', padding: '12px', borderRadius: '10px', marginBottom: '1rem' }}>
                <i className="fa-solid fa-circle-check"></i> Event created successfully! Redirecting...
              </div>
            )}

            <form onSubmit={handleCreateEvent}>
              <label className="form-label-custom">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. SIT AI Summit 2026"
                className="form-control-custom"
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              />

              <div className="row">
                <div className="col-md-6">
                  <label className="form-label-custom">Category *</label>
                  <select
                    className="form-control-custom"
                    value={newEvent.category}
                    onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                  >
                    <option value="Hackathons">Hackathons</option>
                    <option value="Coding Contests">Coding Contests</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Workshops">Workshops</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Reward Pool</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹50,000"
                    className="form-control-custom"
                    value={newEvent.prize}
                    onChange={e => setNewEvent({ ...newEvent, prize: e.target.value })}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <label className="form-label-custom">Date (e.g. Dec 10, 2026) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Date"
                    className="form-control-custom"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab 402"
                    className="form-control-custom"
                    value={newEvent.venue}
                    onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })}
                  />
                </div>
              </div>

              <label className="form-label-custom">Description *</label>
              <textarea
                rows="3"
                required
                placeholder="Describe rules, eligibility, and problem statements..."
                className="form-control-custom"
                value={newEvent.desc}
                onChange={e => setNewEvent({ ...newEvent, desc: e.target.value })}
              ></textarea>

              <button type="submit" className="btn-nexus-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <i className="fa-solid fa-paper-plane"></i> Publish Event to Portal
              </button>
            </form>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default Services;
