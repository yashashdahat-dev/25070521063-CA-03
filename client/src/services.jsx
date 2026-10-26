import React, { useState, useEffect } from 'react';
import Footer from './homeComp/footer';
import { initialEvents } from './home';
import { useAuth } from './AuthContext';
import { API_BASE } from './apiConfig';
import './App.css';

const Services = ({ user: propUser, token }) => {
  const authContext = useAuth ? useAuth() : null;
  const user = propUser || authContext?.user;
  const currentUser = user;
  const isAuthenticated = Boolean(user);

  const [activeTab, setActiveTab] = useState('passes'); // 'passes', 'events', 'host'
  const [userRoll, setUserRoll] = useState(user?.rollNumber || '');
  const [registrations, setRegistrations] = useState([]);
  const [eventsList, setEventsList] = useState(initialEvents);

  // MongoDB & Backend Diagnostics State
  const [dbStatus, setDbStatus] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [reconnectLoading, setReconnectLoading] = useState(false);
  const [reconnectResult, setReconnectResult] = useState('');
  const [inspectorSubTab, setInspectorSubTab] = useState('overview'); // 'overview', 'students', 'registrations', 'compass'

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

  const fetchStatus = () => {
    fetch(`${API_BASE}/api/status`)
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(() => setDbStatus(null));

    fetch(`${API_BASE}/getall`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStudentsList(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    // 1. Read existing local storage
    const saved = JSON.parse(localStorage.getItem('sit_user_registrations') || '[]');
    setRegistrations(saved);

    // 2. Fetch all real registrations from backend server
    fetch(`${API_BASE}/api/events/registrations`)
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

    // 3. Fetch hosted events from MongoDB and merge with static list
    fetch(`${API_BASE}/api/events`)
      .then(res => res.json())
      .then(hostedEvts => {
        if (Array.isArray(hostedEvts) && hostedEvts.length > 0) {
          setEventsList(prev => [
            ...hostedEvts.filter(he => !prev.some(ie => ie.id === he.id)),
            ...prev
          ]);
        }
      })
      .catch(() => {});

    fetchStatus();
  }, []);

  const handleFilterByRoll = () => {
    const saved = JSON.parse(localStorage.getItem('sit_user_registrations') || '[]');
    if (!userRoll.trim()) {
      fetch(`${API_BASE}/api/events/registrations`)
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
    fetch(`${API_BASE}/api/events/registrations/${userRoll.trim()}`)
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
    if (window.confirm('Are you sure you want to cancel this event pass? This will delete it from MongoDB and persistent records.')) {
      // Call backend DELETE to remove from MongoDB and persistent storage
      fetch(`${API_BASE}/api/events/registrations/${id}`, {
        method: 'DELETE'
      }).catch(err => console.error('Cancel pass fetch error:', err));

      const updated = registrations.filter(r => r.id !== id);
      setRegistrations(updated);
      localStorage.setItem('sit_user_registrations', JSON.stringify(updated));
      fetchStatus();
    }
  };

  const handleReconnectMongo = () => {
    setReconnectLoading(true);
    setReconnectResult('');
    fetch(`${API_BASE}/api/mongo/reconnect`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setReconnectResult(data.msg);
        setReconnectLoading(false);
        fetchStatus();
      })
      .catch(() => {
        setReconnectResult('Server unreachable on port 5000');
        setReconnectLoading(false);
      });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const created = {
      id: 'evt-' + Date.now(),
      ...newEvent,
      badge: 'Open',
      badgeClass: 'badge-open',
      registeredTeams: 0,
      maxTeams: 50,
      organizer: 'Student Technical Cell',
      tags: ['Innovation', 'Campus']
    };

    // Persist to MongoDB via backend
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
      if (res.ok) {
        const body = await res.json();
        // Use the server-returned event if available (it may have a DB-assigned id)
        const savedEvent = body.event || created;
        setEventsList(prev => [savedEvent, ...prev]);
      } else {
        // Fallback: add locally even if server errored
        setEventsList(prev => [created, ...prev]);
      }
    } catch {
      // Backend offline — add locally
      setEventsList(prev => [created, ...prev]);
    }

    setNewEventSuccess(true);
    setNewEvent({ title: '', category: 'Hackathons', date: '', time: '', venue: '', prize: '', teamSize: '2 - 4 Members', desc: '' });
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
          <button
            className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('database');
              fetchStatus();
            }}
            style={{
              background: activeTab === 'database' ? 'linear-gradient(135deg, #10b981, #06b6d4)' : undefined,
              borderColor: activeTab === 'database' ? '#10b981' : undefined
            }}
          >
            <i className="fa-solid fa-database"></i> MongoDB Live Inspector & Compass
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
                {isAuthenticated && user?.rollNumber && userRoll !== user.rollNumber && (
                  <button
                    className="btn-nexus-glass"
                    onClick={() => {
                      setUserRoll(user.rollNumber);
                      // Trigger search immediately with user's roll number
                      const saved = JSON.parse(localStorage.getItem('sit_user_registrations') || '[]');
                      const query = user.rollNumber.toLowerCase();
                      const localFiltered = saved.filter(r =>
                        (r.rollNumber && r.rollNumber.toLowerCase().includes(query)) ||
                        (r.leaderName && r.leaderName.toLowerCase().includes(query))
                      );
                      setRegistrations(localFiltered);
                    }}
                    title="Filter to my passes"
                    style={{ whiteSpace: 'nowrap', padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <i className="fa-solid fa-user me-1"></i> My Passes
                  </button>
                )}
                {userRoll && (
                  <button 
                    className="btn-nexus-outline" 
                    onClick={() => {
                      setUserRoll('');
                      fetch(`${API_BASE}/api/events/registrations`)
                        .then(res => res.json())
                        .then(serverData => {
                          if (Array.isArray(serverData)) setRegistrations(serverData);
                          else setRegistrations(JSON.parse(localStorage.getItem('sit_user_registrations') || '[]'));
                        })
                        .catch(() => setRegistrations(JSON.parse(localStorage.getItem('sit_user_registrations') || '[]')));
                    }}
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

        {/* TAB 4: MONGODB LIVE INSPECTOR & COMPASS GUIDE */}
        {activeTab === 'database' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto 3rem' }}>
            {/* Header Box */}
            <div
              style={{
                background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.9))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '18px',
                padding: '1.75rem',
                marginBottom: '1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span
                    style={{
                      background: dbStatus?.mongoConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                      color: dbStatus?.mongoConnected ? '#10b981' : '#f59e0b',
                      border: `1px solid ${dbStatus?.mongoConnected ? '#10b981' : '#f59e0b'}`,
                      borderRadius: '999px',
                      padding: '3px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}
                  >
                    <i className={`fa-solid ${dbStatus?.mongoConnected ? 'fa-circle-check' : 'fa-triangle-exclamation'} me-1`}></i>
                    {dbStatus?.mongoConnected ? 'MongoDB Live: Connected' : 'Storage Mode: Local JSON File Store'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>FLEXI Full-Stack Integration</span>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                  MongoDB & Compass Storage Inspector
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
                  Real-time database records, schema verification, and MongoDB Compass connectivity guide.
                </p>
              </div>

              <div className="d-flex gap-2">
                <button
                  onClick={fetchStatus}
                  className="btn-nexus-glass"
                  style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                >
                  <i className="fa-solid fa-arrows-rotate me-1"></i> Refresh Data
                </button>
                <button
                  onClick={handleReconnectMongo}
                  disabled={reconnectLoading}
                  className="btn-nexus-primary"
                  style={{ padding: '8px 16px', fontSize: '0.84rem', background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                >
                  {reconnectLoading ? (
                    <span><i className="fa-solid fa-circle-notch fa-spin me-1"></i> Connecting...</span>
                  ) : (
                    <span><i className="fa-solid fa-plug me-1"></i> Test Mongo Connection</span>
                  )}
                </button>
              </div>
            </div>

            {reconnectResult && (
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  color: '#a5b4fc',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  fontSize: '0.86rem'
                }}
              >
                <i className="fa-solid fa-circle-info me-2"></i> {reconnectResult}
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="glass-card text-center" style={{ padding: '1.2rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Database Name</div>
                  <div style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>sitSecB</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="glass-card text-center" style={{ padding: '1.2rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Compass Port</div>
                  <div style={{ color: '#818cf8', fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>27017</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="glass-card text-center" style={{ padding: '1.2rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Students Collection</div>
                  <div style={{ color: '#f59e0b', fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                    {dbStatus?.counts?.students ?? studentsList.length} docs
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="glass-card text-center" style={{ padding: '1.2rem' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>Event Passes Collection</div>
                  <div style={{ color: '#ec4899', fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
                    {dbStatus?.counts?.registrations ?? registrations.length} docs
                  </div>
                </div>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="d-flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setInspectorSubTab('overview')}
                className={`tab-btn ${inspectorSubTab === 'overview' ? 'active' : ''}`}
                style={{ padding: '6px 16px', fontSize: '0.84rem' }}
              >
                <i className="fa-solid fa-server me-1"></i> Architecture Overview
              </button>
              <button
                type="button"
                onClick={() => setInspectorSubTab('students')}
                className={`tab-btn ${inspectorSubTab === 'students' ? 'active' : ''}`}
                style={{ padding: '6px 16px', fontSize: '0.84rem' }}
              >
                <i className="fa-solid fa-users me-1"></i> 'student' Collection ({studentsList.length})
              </button>
              <button
                type="button"
                onClick={() => setInspectorSubTab('registrations')}
                className={`tab-btn ${inspectorSubTab === 'registrations' ? 'active' : ''}`}
                style={{ padding: '6px 16px', fontSize: '0.84rem' }}
              >
                <i className="fa-solid fa-ticket me-1"></i> 'event_registrations' ({registrations.length})
              </button>
              <button
                type="button"
                onClick={() => setInspectorSubTab('compass')}
                className={`tab-btn ${inspectorSubTab === 'compass' ? 'active' : ''}`}
                style={{ padding: '6px 16px', fontSize: '0.84rem' }}
              >
                <i className="fa-solid fa-compass me-1"></i> MongoDB Compass Guide
              </button>
            </div>

            {/* SUB-VIEW 1: ARCHITECTURE OVERVIEW */}
            {inspectorSubTab === 'overview' && (
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#f8fafc' }}>
                  <i className="fa-solid fa-layer-group text-primary me-2"></i>
                  FLEXI Full-Stack Architecture Mapping
                </h4>

                <div className="table-responsive">
                  <table className="table table-dark table-hover" style={{ background: 'transparent', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ color: '#818cf8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th>Layer</th>
                        <th>Technology</th>
                        <th>Integration Details</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Frontend</strong></td>
                        <td>React 18 + Vite (SPA)</td>
                        <td>Component UI, React Router DOM, Glassmorphic CSS, fetch API</td>
                        <td><span className="badge bg-success">Active on Port 5173</span></td>
                      </tr>
                      <tr>
                        <td><strong>Backend</strong></td>
                        <td>Node.js + Express.js</td>
                        <td>RESTful API with CORS, JWT authentication, Bcrypt password hashing</td>
                        <td><span className="badge bg-success">Active on Port 5000</span></td>
                      </tr>
                      <tr>
                        <td><strong>Database Driver</strong></td>
                        <td>Official MongoDB Node Driver</td>
                        <td>MongoClient (`mongodb` v7.7.0) with automatic BSON ObjectId support</td>
                        <td><span className="badge bg-primary">Configured</span></td>
                      </tr>
                      <tr>
                        <td><strong>Database Service</strong></td>
                        <td>MongoDB Compass / Service</td>
                        <td>Database: <code>sitSecB</code> | URI: <code>mongodb://localhost:27017</code></td>
                        <td>
                          <span className={`badge ${dbStatus?.mongoConnected ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {dbStatus?.mongoConnected ? 'Connected' : 'Offline / JSON Fallback'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Persistent Fallback</strong></td>
                        <td>File-based JSON Store</td>
                        <td><code>server/data/students.json</code> &amp; <code>registrations.json</code></td>
                        <td><span className="badge bg-info">Auto-Synced</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: STUDENTS COLLECTION */}
            {inspectorSubTab === 'students' && (
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 style={{ fontSize: '1.15rem', margin: 0, color: '#f8fafc' }}>
                    <i className="fa-solid fa-users text-primary me-2"></i>
                    Collection: <code>sitSecB.student</code> ({studentsList.length} documents)
                  </h4>
                  <small style={{ color: '#94a3b8' }}>Populated via Sign Up &amp; Student Registration</small>
                </div>

                {studentsList.length === 0 ? (
                  <div className="text-center py-4" style={{ color: '#94a3b8' }}>
                    No student records currently in database. Register an account on the <a href="/signup" style={{ color: '#818cf8' }}>Sign Up</a> page.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover" style={{ background: 'transparent', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ color: '#818cf8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th>_id</th>
                          <th>Full Name</th>
                          <th>Roll Number / PRN</th>
                          <th>Email</th>
                          <th>Branch / Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsList.map((s, idx) => (
                          <tr key={s._id || idx}>
                            <td><code style={{ color: '#06b6d4', fontSize: '0.78rem' }}>{String(s._id).substring(0, 16)}...</code></td>
                            <td><strong>{s.name}</strong></td>
                            <td><span className="badge bg-secondary">{s.rollNumber || 'N/A'}</span></td>
                            <td>{s.email}</td>
                            <td style={{ color: '#94a3b8' }}>{s.branch || s.status || 'Active Student'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 3: REGISTRATIONS COLLECTION */}
            {inspectorSubTab === 'registrations' && (
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 style={{ fontSize: '1.15rem', margin: 0, color: '#f8fafc' }}>
                    <i className="fa-solid fa-ticket text-primary me-2"></i>
                    Collection: <code>sitSecB.event_registrations</code> ({registrations.length} documents)
                  </h4>
                  <small style={{ color: '#94a3b8' }}>Populated via Event &amp; Hackathon Registration</small>
                </div>

                {registrations.length === 0 ? (
                  <div className="text-center py-4" style={{ color: '#94a3b8' }}>
                    No registrations found. Register for a hackathon on the <a href="/#events" style={{ color: '#818cf8' }}>Home</a> page.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover" style={{ background: 'transparent', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ color: '#818cf8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th>Pass ID</th>
                          <th>Event Title</th>
                          <th>Team Name</th>
                          <th>Leader</th>
                          <th>Roll Number</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((r, idx) => (
                          <tr key={r.id || idx}>
                            <td><span className="badge bg-primary" style={{ fontFamily: 'monospace' }}>{r.id}</span></td>
                            <td><strong>{r.eventTitle}</strong></td>
                            <td style={{ color: '#ec4899' }}>{r.teamName}</td>
                            <td>{r.leaderName}</td>
                            <td><code>{r.rollNumber}</code></td>
                            <td>
                              <button
                                onClick={() => handleCancelRegistration(r.id)}
                                className="btn btn-sm btn-outline-danger"
                                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                                title="Delete document from MongoDB"
                              >
                                <i className="fa-solid fa-trash me-1"></i> Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW 4: MONGODB COMPASS GUIDE */}
            {inspectorSubTab === 'compass' && (
              <div className="glass-card" style={{ padding: '1.75rem' }}>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: '#f8fafc' }}>
                  <i className="fa-solid fa-compass text-success me-2"></i>
                  How to Inspect in MongoDB Compass GUI
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Follow these step-by-step instructions to view live documents in MongoDB Compass:
                </p>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.2rem', height: '100%' }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-success">Step 1</span>
                        <strong style={{ color: '#fff' }}>Open MongoDB Compass</strong>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                        In the connection string box, enter the default local URI:
                      </p>
                      <div style={{ background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', fontFamily: 'monospace', fontSize: '0.88rem', color: '#10b981' }}>
                        mongodb://localhost:27017
                      </div>
                      <small style={{ color: '#64748b', display: 'block', marginTop: '6px' }}>
                        Click <strong>Connect</strong>.
                      </small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.2rem', height: '100%' }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-success">Step 2</span>
                        <strong style={{ color: '#fff' }}>Select Database &amp; Collections</strong>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                        In the left sidebar of MongoDB Compass:
                      </p>
                      <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: '1.2rem', marginBottom: 0 }}>
                        <li>Click on the database: <strong style={{ color: '#10b981' }}>sitSecB</strong></li>
                        <li>Click on collection: <strong style={{ color: '#818cf8' }}>student</strong></li>
                        <li>Click on collection: <strong style={{ color: '#ec4899' }}>event_registrations</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px dashed rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1rem', marginTop: '1.25rem' }}>
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-lightbulb text-success"></i>
                    <strong style={{ color: '#6ee7b7', fontSize: '0.88rem' }}>Verification Checklist:</strong>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0.4rem 0 0 0' }}>
                    Whenever you register a student on <code>/signup</code> or an event pass on the <code>Home</code> page, you can click <strong>Refresh</strong> in MongoDB Compass to observe the new document immediately appear in MongoDB!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default Services;
