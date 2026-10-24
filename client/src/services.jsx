import React, { useState, useEffect } from 'react';
import Footer from './homeComp/footer';
import { initialEvents } from './home';
import './App.css';

const Services = () => {
  const [activeTab, setActiveTab] = useState('passes'); // 'passes', 'events', 'host'
  const [userRoll, setUserRoll] = useState('');
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
    // 1. Read existing local storage
    const saved = JSON.parse(localStorage.getItem('sit_user_registrations') || '[]');
    setRegistrations(saved);

    // 2. Fetch all real registrations from backend server
    fetch('http://localhost:5000/api/events/registrations')
      .then(res => res.json())
      .then(serverData => {
        if (Array.isArray(serverData)) {
          setRegistrations(serverData);
          localStorage.setItem('sit_user_registrations', JSON.stringify(serverData));
        }
      })
      .catch(() => {
        console.log('>>> Server offline, using localStorage data');
      });
  }, []);

  const handleFilterByRoll = () => {
    const saved = JSON.parse(localStorage.getItem('sit_user_registrations') || '[]');
    if (!userRoll.trim()) {
      fetch('http://localhost:5000/api/events/registrations')
        .then(res => res.json())
        .then(serverData => {
          if (Array.isArray(serverData)) {
            setRegistrations(serverData);
          } else {
            setRegistrations(saved);
          }
        })
        .catch(() => setRegistrations(saved));
      return;
    }

    const query = userRoll.trim().toLowerCase();
    // Filter locally first across roll, leader, or team name
    const localFiltered = saved.filter(r => 
      (r.rollNumber && r.rollNumber.toLowerCase().includes(query)) ||
      (r.leaderName && r.leaderName.toLowerCase().includes(query)) ||
      (r.teamName && r.teamName.toLowerCase().includes(query))
    );
    setRegistrations(localFiltered);

    // Also query backend endpoint
    fetch(`http://localhost:5000/api/events/registrations/${userRoll.trim()}`)
      .then(res => res.json())
      .then(serverData => {
        if (Array.isArray(serverData) && serverData.length > 0) {
          const localIds = new Set(localFiltered.map(r => r.id));
          const newFromServer = serverData.filter(r => !localIds.has(r.id));
          if (newFromServer.length > 0) {
            setRegistrations([...localFiltered, ...newFromServer]);
          }
        }
      })
      .catch(() => {});
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
          <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto' }}>
            Track your team registrations, manage entry passes, or submit new club events.
          </p>
        </div>

        {/* Tab Controls (Clean 3 Tabs) */}
        <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
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
                <h4 style={{ margin: 0, fontSize: '1.15rem' }}>Lookup Passes by Roll Number or Team</h4>
                <small style={{ color: '#94a3b8' }}>Search any registered participant or team pass</small>
              </div>

              <div className="d-flex gap-2" style={{ maxWidth: '420px', width: '100%' }}>
                <input
                  type="text"
                  className="form-control-custom"
                  style={{ margin: 0 }}
                  placeholder="Enter Roll No or Team Name..."
                  value={userRoll}
                  onChange={e => setUserRoll(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleFilterByRoll()}
                />
                <button className="btn-nexus-primary" onClick={handleFilterByRoll}>
                  <i className="fa-solid fa-magnifying-glass"></i> Search
                </button>
                {userRoll && (
                  <button 
                    className="btn-nexus-outline" 
                    onClick={() => { setUserRoll(''); handleFilterByRoll(); }}
                    title="Clear filter"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Passes Grid */}
            {registrations.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '4rem 1.5rem', background: 'var(--bg-card)',
                borderRadius: '16px', border: '1px dashed var(--border-glass)'
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#818cf8'
                }}>
                  <i className="fa-solid fa-ticket" style={{ fontSize: '1.8rem' }}></i>
                </div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
                  {userRoll ? `No Passes Found for "${userRoll}"` : "No Registered Passes Yet"}
                </h3>
                <p style={{ color: '#94a3b8', maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.92rem' }}>
                  {userRoll 
                    ? "No event passes matched your search term. Check the roll number or clear the search to view all passes."
                    : "There are currently no registrations stored in the system. When you or another team registers for an event on the Home page, the official pass will appear right here!"}
                </p>
                <a href="/#events" className="btn-nexus-primary" style={{ display: 'inline-flex' }}>
                  <i className="fa-solid fa-bolt me-2"></i> Browse & Register for an Event
                </a>
              </div>
            ) : (
              <div className="row g-4">
                {registrations.map(reg => (
                  <div key={reg.id} className="col-lg-6">
                    <div style={{
                      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.85))',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                      position: 'relative'
                    }}>
                      {/* Top Bar Ticket Style */}
                      <div style={{
                        background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                        padding: '10px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fa-solid fa-qrcode" style={{ fontSize: '1.2rem', color: '#fff' }}></i>
                          <span style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '0.9rem', color: '#fff' }}>
                            OFFICIAL EVENT PASS
                          </span>
                        </div>
                        <span style={{
                          background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px',
                          fontSize: '0.75rem', fontWeight: 700, color: '#fff'
                        }}>
                          {reg.id}
                        </span>
                      </div>

                      {/* Ticket Body */}
                      <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div>
                            <span style={{
                              fontSize: '0.72rem', textTransform: 'uppercase', color: '#38bdf8',
                              fontWeight: 700, letterSpacing: '0.5px'
                            }}>
                              Confirmed Registration
                            </span>
                            <h3 style={{ fontSize: '1.35rem', margin: '4px 0 0', color: '#f8fafc' }}>
                              {reg.eventTitle}
                            </h3>
                          </div>
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)',
                            padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700
                          }}>
                            ✓ {reg.status || 'Confirmed'}
                          </span>
                        </div>

                        {/* Details grid */}
                        <div style={{
                          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px',
                          background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <div>
                            <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>TEAM NAME</small>
                            <strong style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>{reg.teamName}</strong>
                          </div>
                          <div>
                            <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>TEAM SIZE</small>
                            <span style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>{reg.teamSize} Members</span>
                          </div>
                          <div>
                            <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>LEADER / PARTICIPANT</small>
                            <span style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>{reg.leaderName}</span>
                          </div>
                          <div>
                            <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>ROLL NUMBER</small>
                            <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.95rem' }}>{reg.rollNumber}</span>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <small style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>VENUE & SCHEDULE</small>
                            <span style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>
                              <i className="fa-regular fa-calendar me-1" style={{ color: '#38bdf8' }}></i> {reg.eventDate} | 
                              <i className="fa-solid fa-location-dot ms-2 me-1" style={{ color: '#f43f5e' }}></i> {reg.venue}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            Registered on: {reg.registeredAt || 'Today'}
                          </small>
                          <div className="d-flex gap-2">
                            <button
                              className="btn-nexus-outline"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => window.print()}
                            >
                              <i className="fa-solid fa-print"></i> Print Pass
                            </button>
                            <button
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)',
                                padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer'
                              }}
                              onClick={() => handleCancelRegistration(reg.id)}
                            >
                              <i className="fa-solid fa-trash-can"></i> Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL EVENTS */}
        {activeTab === 'events' && (
          <div>
            <div className="row g-4">
              {eventsList.map(evt => (
                <div key={evt.id} className="col-lg-4 col-md-6">
                  <div className="event-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="event-category-tag">{evt.category}</span>
                      <span className={`event-badge ${evt.badgeClass || 'badge-open'}`}>{evt.badge}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', margin: '4px 0 8px' }}>{evt.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', flexGrow: 1 }}>{evt.desc}</p>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.82rem' }}>
                      <div><i className="fa-regular fa-calendar me-2" style={{ color: '#818cf8' }}></i>{evt.date}</div>
                      <div><i className="fa-solid fa-location-dot me-2" style={{ color: '#f43f5e' }}></i>{evt.venue}</div>
                      <div><i className="fa-solid fa-trophy me-2" style={{ color: '#fbbf24' }}></i>{evt.prize}</div>
                    </div>
                    <a href="/#events" className="btn-nexus-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Register on Home <i className="fa-solid fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HOST NEW EVENT */}
        {activeTab === 'host' && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
            borderRadius: '18px', padding: '2rem', maxWidth: '750px', margin: '0 auto 3rem'
          }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Host a Campus Event or Hackathon
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Student bodies, ACM, IEEE, GDSC, and clubs can publish technical events to the SIT Nexus portal.
            </p>

            {newEventSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981',
                padding: '12px 18px', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600
              }}>
                <i className="fa-solid fa-circle-check me-2"></i> Event submitted and published to live events grid!
              </div>
            )}

            <form onSubmit={handleCreateEvent}>
              <label className="form-label-custom">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. CodeStorm 2026: Algorithmic Duel"
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
