import React, { useState, useEffect } from 'react';
import Footer from './homeComp/footer';
import { initialEvents } from './home';
import './App.css';

const Services = () => {
  const [activeTab, setActiveTab] = useState('passes'); // 'passes', 'events', 'host', 'storage'
  const [userRoll, setUserRoll] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [eventsList, setEventsList] = useState(initialEvents);

  // Storage Inspector State
  const [serverStatus, setServerStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [copiedNote, setCopiedNote] = useState('');

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
    setLoadingStatus(true);
    fetch('http://localhost:5000/api/status')
      .then(res => res.json())
      .then(data => {
        setServerStatus(data);
        setLoadingStatus(false);
      })
      .catch(err => {
        setServerStatus({
          server: "SIT NEXUS CA-03 Backend",
          status: "OFFLINE",
          error: err.message
        });
        setLoadingStatus(false);
      });
  };

  useEffect(() => {
    // 1. Read existing local storage (starts empty if no one has registered yet)
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

    // Also load diagnostic server status
    fetchStatus();
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    setCopiedNote(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedNote(''), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '2.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.25rem' }}>
        
        {/* Title & Tabs */}
        <div className="text-center mb-4">
          <span className="event-category-tag">Student Dashboard & Data Hub</span>
          <h1 style={{ fontSize: '2.6rem', marginTop: '6px' }}>
            Event Hub & <span className="gradient-text">Pass Manager</span>
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto' }}>
            Track your team registrations, manage entry passes, submit events, and inspect where all student data is saved.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
          <button
            className={`tab-btn ${activeTab === 'passes' ? 'active' : ''}`}
            onClick={() => setActiveTab('passes')}
          >
            <i className="fa-solid fa-id-card"></i> Registered Passes ({registrations.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <i className="fa-solid fa-calendar-days"></i> All Campus Events ({eventsList.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'storage' ? 'active' : ''}`}
            onClick={() => { setActiveTab('storage'); fetchStatus(); }}
          >
            <i className="fa-solid fa-database"></i> Where is Data Stored? (Inspector)
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

        {/* TAB 3: WHERE IS DATA STORED? (STORAGE INSPECTOR) */}
        {activeTab === 'storage' && (
          <div>
            {/* Header notification */}
            {copiedNote && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981',
                padding: '10px 18px', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600
              }}>
                <i className="fa-solid fa-check-circle me-2"></i> {copiedNote}
              </div>
            )}

            {/* Storage Diagnostic Summary Cards */}
            <div className="row g-3 mb-4">
              {/* Card 1: JSON File Persistent Store */}
              <div className="col-md-6 col-lg-3">
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                  borderRadius: '16px', padding: '1.25rem', height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8'
                    }}>
                      <i className="fa-solid fa-file-code"></i>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Local JSON File</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
                    {serverStatus?.counts?.registrations ?? registrations.length} Passes
                  </div>
                  <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    Auto-saved on disk upon registration
                  </small>
                  <span style={{
                    display: 'inline-block', marginTop: '8px', background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700
                  }}>
                    ✓ Active File
                  </span>
                </div>
              </div>

              {/* Card 2: Students Records */}
              <div className="col-md-6 col-lg-3">
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                  borderRadius: '16px', padding: '1.25rem', height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(129, 140, 248, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8'
                    }}>
                      <i className="fa-solid fa-user-graduate"></i>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Student Records</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>
                    {serverStatus?.counts?.students ?? 0} Students
                  </div>
                  <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    CA-03 Student Collection
                  </small>
                  <span style={{
                    display: 'inline-block', marginTop: '8px', background: 'rgba(129, 140, 248, 0.15)',
                    color: '#818cf8', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700
                  }}>
                    /create & /getall
                  </span>
                </div>
              </div>

              {/* Card 3: Backend Express Port */}
              <div className="col-md-6 col-lg-3">
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                  borderRadius: '16px', padding: '1.25rem', height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981'
                    }}>
                      <i className="fa-solid fa-server"></i>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Express Server</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: serverStatus?.status === 'ONLINE' ? '#10b981' : '#f43f5e' }}>
                    {serverStatus?.status || 'CHECKING...'}
                  </div>
                  <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    Port: 5000 (REST API)
                  </small>
                  <a
                    href="http://localhost:5000/api/status"
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.72rem', color: '#38bdf8', textDecoration: 'underline', display: 'inline-block', marginTop: '8px' }}
                  >
                    View Status API <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                </div>
              </div>

              {/* Card 4: MongoDB Connection */}
              <div className="col-md-6 col-lg-3">
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
                  borderRadius: '16px', padding: '1.25rem', height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b'
                    }}>
                      <i className="fa-solid fa-leaf"></i>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>MongoDB</span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: serverStatus?.mongoConnected ? '#10b981' : '#f59e0b' }}>
                    {serverStatus?.mongoConnected ? 'CONNECTED' : 'STANDBY'}
                  </div>
                  <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    DB: sitSecB (Auto-syncs)
                  </small>
                  <span style={{
                    display: 'inline-block', marginTop: '8px', background: 'rgba(255,255,255,0.06)',
                    color: '#cbd5e1', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px'
                  }}>
                    JSON Backup Active
                  </span>
                </div>
              </div>
            </div>

            {/* Exact Storage Location Details */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
              borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem'
            }}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                    <i className="fa-solid fa-folder-tree me-2" style={{ color: '#818cf8' }}></i>
                    Where Can You Check Your Information?
                  </h3>
                  <small style={{ color: '#94a3b8' }}>3 quick ways to view your saved registration records</small>
                </div>
                <button
                  className="btn-nexus-outline"
                  onClick={fetchStatus}
                  disabled={loadingStatus}
                  style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                >
                  <i className={`fa-solid fa-arrows-rotate ${loadingStatus ? 'fa-spin' : ''}`}></i> Refresh Backend Data
                </button>
              </div>

              {/* Way 1: File on PC */}
              <div style={{
                background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem'
              }}>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <span style={{
                      background: '#4f46e5', color: '#fff', fontSize: '0.72rem', padding: '2px 8px',
                      borderRadius: '4px', fontWeight: 700, marginRight: '8px'
                    }}>
                      METHOD 1
                    </span>
                    <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>
                      On Your Local Disk (Windows File Explorer or Notepad)
                    </strong>
                  </div>
                  <button
                    className="btn-nexus-primary"
                    style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                    onClick={() => copyToClipboard('C:\\Users\\yasha\\OneDrive\\Desktop\\25070521063\\server\\data\\registrations.json', 'File Path')}
                  >
                    <i className="fa-regular fa-copy"></i> Copy Path
                  </button>
                </div>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '8px 0 6px' }}>
                  Open File Explorer or Notepad and navigate to:
                </p>
                <div style={{
                  background: '#090d16', padding: '10px 14px', borderRadius: '8px',
                  fontFamily: 'Consolas, monospace', fontSize: '0.85rem', color: '#38bdf8', overflowX: 'auto'
                }}>
                  C:\Users\yasha\OneDrive\Desktop\25070521063\server\data\registrations.json
                </div>
                <small style={{ color: '#94a3b8', display: 'block', marginTop: '6px' }}>
                  Student logins are saved in <code>students.json</code> in the same folder.
                </small>
              </div>

              {/* Way 2: Browser REST API */}
              <div style={{
                background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem'
              }}>
                <span style={{
                  background: '#0ea5e9', color: '#fff', fontSize: '0.72rem', padding: '2px 8px',
                  borderRadius: '4px', fontWeight: 700, marginRight: '8px'
                }}>
                  METHOD 2
                </span>
                <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>
                  Direct REST API Endpoints (Click to Open in Browser)
                </strong>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '8px 0 10px' }}>
                  Your Express backend on port 5000 serves live JSON data at these endpoints:
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <a
                    href="http://localhost:5000/api/events/registrations"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-nexus-outline"
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> /api/events/registrations (All Passes)
                  </a>
                  <a
                    href="http://localhost:5000/api/status"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-nexus-outline"
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> /api/status (Storage Diagnostics)
                  </a>
                  <a
                    href="http://localhost:5000/getall"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-nexus-outline"
                    style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> /getall (All CA-03 Students)
                  </a>
                </div>
              </div>

              {/* Way 3: MongoDB */}
              <div style={{
                background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', padding: '1.25rem'
              }}>
                <span style={{
                  background: '#10b981', color: '#fff', fontSize: '0.72rem', padding: '2px 8px',
                  borderRadius: '4px', fontWeight: 700, marginRight: '8px'
                }}>
                  METHOD 3
                </span>
                <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>
                  MongoDB Database (sitSecB)
                </strong>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '8px 0 6px' }}>
                  If MongoDB service is running, records are stored in:
                </p>
                <ul style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, paddingLeft: '1.25rem' }}>
                  <li>Database: <code>sitSecB</code></li>
                  <li>Collection 1: <code>event_registrations</code> (stores team name, event title, roll number, ticket ID)</li>
                  <li>Collection 2: <code>student</code> (stores student name, roll/email, hashed password, status)</li>
                </ul>
              </div>
            </div>

            {/* LIVE DATA VIEWER TABLE */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-glass)',
              borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                <i className="fa-solid fa-table-list me-2" style={{ color: '#38bdf8' }}></i>
                Live Stored Registrations (Server Data)
              </h3>
              
              {(!serverStatus?.registrations || serverStatus.registrations.length === 0) && registrations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  <i className="fa-solid fa-inbox mb-2" style={{ fontSize: '2rem' }}></i>
                  <p style={{ margin: 0 }}>No records stored yet. Register a team to see real-time data appear here!</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Pass ID</th>
                        <th style={{ padding: '10px' }}>Event</th>
                        <th style={{ padding: '10px' }}>Team Name</th>
                        <th style={{ padding: '10px' }}>Leader</th>
                        <th style={{ padding: '10px' }}>Roll Number</th>
                        <th style={{ padding: '10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(serverStatus?.registrations || registrations).map((r, idx) => (
                        <tr key={r.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f8fafc' }}>
                          <td style={{ padding: '10px' }}><code style={{ color: '#38bdf8' }}>{r.id}</code></td>
                          <td style={{ padding: '10px', fontWeight: 600 }}>{r.eventTitle}</td>
                          <td style={{ padding: '10px' }}>{r.teamName}</td>
                          <td style={{ padding: '10px' }}>{r.leaderName}</td>
                          <td style={{ padding: '10px' }}><strong style={{ color: '#818cf8' }}>{r.rollNumber}</strong></td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                              padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700
                            }}>
                              {r.status || 'Confirmed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Raw JSON Accordion */}
              <details style={{ marginTop: '1.5rem' }}>
                <summary style={{ cursor: 'pointer', color: '#818cf8', fontWeight: 600, fontSize: '0.88rem' }}>
                  <i className="fa-solid fa-code me-1"></i> View Live Raw JSON Payloads
                </summary>
                <div style={{
                  background: '#090d16', padding: '1rem', borderRadius: '10px', marginTop: '10px',
                  maxHeight: '300px', overflowY: 'auto'
                }}>
                  <pre style={{ margin: 0, color: '#38bdf8', fontSize: '0.8rem', fontFamily: 'Consolas, monospace' }}>
                    {JSON.stringify(serverStatus || { localPasses: registrations }, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        )}

        {/* TAB 4: HOST NEW EVENT */}
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
