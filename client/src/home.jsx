import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './homeComp/header';
import MainContent from './homeComp/mainContentCont';
import Footer from './homeComp/footer';
import { API_BASE } from './apiConfig';
import './App.css';

// Initial Event Data
export const initialEvents = [
  {
    id: 'evt-1',
    title: 'HackSIT 2026: 36-Hour National Hackathon',
    category: 'Hackathons',
    date: 'Nov 14 - 16, 2026',
    time: '9:00 AM IST onwards',
    venue: 'Campus Tech Audi & Computing Labs',
    prize: '₹2,50,000',
    teamSize: '2 - 4 Members',
    badge: 'Live',
    badgeClass: 'badge-live',
    registeredTeams: 84,
    maxTeams: 100,
    organizer: 'SIT ACM & Web Dev Chapter',
    tags: ['AI/ML', 'Web3', 'IoT', 'FinTech'],
    desc: 'The biggest annual national hackathon at SIT. Build innovative solutions for smart campus, healthcare, and sustainable tech.'
  },
  {
    id: 'evt-2',
    title: 'CodeSprint 2026: Algorithmic Battle',
    category: 'Coding Contests',
    date: 'Nov 02, 2026',
    time: '4:00 PM - 7:00 PM',
    venue: 'Virtual & Lab 304',
    prize: '₹40,000',
    teamSize: 'Individual (1)',
    badge: 'Filling Fast',
    badgeClass: 'badge-fast',
    registeredTeams: 142,
    maxTeams: 160,
    organizer: 'Competitive Programming Society',
    tags: ['DSA', 'Graphs', 'Dynamic Prog', 'C++ / Java'],
    desc: '3-hour speed coding contest modeled after ICPC prelims. Solve 7 increasingly tough algorithmic challenges.'
  },
  {
    id: 'evt-3',
    title: 'RoboClash: Autonomous Bot Derby',
    category: 'Robotics',
    date: 'Nov 08, 2026',
    time: '10:00 AM - 5:00 PM',
    venue: 'Indoor Sports Complex Arena',
    prize: '₹75,000',
    teamSize: '2 - 3 Members',
    badge: 'Open',
    badgeClass: 'badge-open',
    registeredTeams: 26,
    maxTeams: 40,
    organizer: 'Robotics & Automation Society',
    tags: ['Arduino', 'ROS', 'Sensors', 'Hardware'],
    desc: 'Autonomous obstacle avoidance and line-following robotic rover showdown on an obstacle-strewn turf.'
  },
  {
    id: 'evt-4',
    title: 'Hands-On GenAI & Agentic AI Bootcamp',
    category: 'Workshops',
    date: 'Oct 30, 2026',
    time: '2:00 PM - 6:00 PM',
    venue: 'Seminar Hall B & Online Stream',
    prize: 'Swag + Certs',
    teamSize: '1 Member',
    badge: 'Open',
    badgeClass: 'badge-open',
    registeredTeams: 190,
    maxTeams: 250,
    organizer: 'Google Developer Student Club SIT',
    tags: ['LLMs', 'LangChain', 'Python', 'Vector DBs'],
    desc: 'Build full-stack AI agents from scratch with industry engineers using state-of-the-art developer toolchains.'
  },
  {
    id: 'evt-5',
    title: 'CyberDefend CTF: Capture The Flag',
    category: 'Coding Contests',
    date: 'Nov 20, 2026',
    time: '12:00 PM - 12:00 AM (12h)',
    venue: 'Network Security Lab',
    prize: '₹60,000',
    teamSize: '1 - 3 Members',
    badge: 'Open',
    badgeClass: 'badge-open',
    registeredTeams: 45,
    maxTeams: 80,
    organizer: 'Cyber Security Research Wing',
    tags: ['Reverse Eng', 'Cryptography', 'Web Exploits'],
    desc: '12-hour intense jeopardy-style cyber challenge covering forensic analysis, binary exploitation, and steganography.'
  },
  {
    id: 'evt-6',
    title: 'SIT Technovation Ideathon 2026',
    category: 'Hackathons',
    date: 'Dec 01, 2026',
    time: '10:00 AM - 4:00 PM',
    venue: 'Incubation & Entrepreneurship Cell',
    prize: '₹1,00,000 Seed Grant',
    teamSize: '2 - 4 Members',
    badge: 'Open',
    badgeClass: 'badge-open',
    registeredTeams: 31,
    maxTeams: 50,
    organizer: 'E-Cell & TBI SIT',
    tags: ['Startups', 'Pitch Deck', 'Product Design'],
    desc: 'Pitch your breakthrough tech venture to venture capitalists and startup founders for seed grants and mentorship.'
  }
];

const Home = ({ user: propUser, token }) => {
  const authContext = useAuth ? useAuth() : null;
  const user = propUser || authContext?.user;
  const currentUser = user;
  const isAuthenticated = Boolean(user);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalEvent, setActiveModalEvent] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(null);
  const [regError, setRegError] = useState('');
  const [hostedEvents, setHostedEvents] = useState([]);

  // Fetch hosted events from MongoDB on mount and merge with static list
  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setHostedEvents(data);
        }
      })
      .catch(() => {}); // Backend offline — static list still works
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    teamName: '',
    leaderName: '',
    rollNumber: '',
    email: '',
    branch: 'Computer Science',
    teamSize: '2',
    projectIdea: ''
  });

  const categories = ['All', 'Hackathons', 'Coding Contests', 'Robotics', 'Workshops'];

  // Merge static events with hosted events from MongoDB (hosted events appear first if unique ids)
  const allEvents = [
    ...hostedEvents.filter(he => !initialEvents.some(ie => ie.id === he.id)),
    ...initialEvents
  ];

  // Filter Logic
  const filteredEvents = allEvents.filter(event => {
    const matchesCat = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenRegister = (event) => {
    setActiveModalEvent(event);
    setFormData({
      teamName: '',
      leaderName: currentUser?.name || '',
      rollNumber: currentUser?.rollNumber || '',
      email: currentUser?.email || '',
      branch: currentUser?.branch || 'Computer Science',
      teamSize: '2',
      projectIdea: ''
    });
    setRegisteredSuccess(null);
    setRegError('');
  };

  const handleCloseModal = () => {
    setActiveModalEvent(null);
    setRegisteredSuccess(null);
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setRegError('');

    const newRegistration = {
      id: 'TICKET-' + Math.floor(100000 + Math.random() * 900000),
      eventId: activeModalEvent.id,
      eventTitle: activeModalEvent.title,
      eventDate: activeModalEvent.date,
      venue: activeModalEvent.venue,
      teamName: formData.teamName,
      leaderName: formData.leaderName,
      rollNumber: formData.rollNumber,
      email: formData.email,
      branch: formData.branch || currentUser?.branch || 'Computer Science',
      teamSize: formData.teamSize,
      registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Confirmed'
    };

    // 1. Send registration to backend — checks duplicate roll+event and updates student status in sitSecB
    try {
      const regRes = await fetch(`${API_BASE}/api/events/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newRegistration)
      });

      if (regRes.status === 409) {
        const errBody = await regRes.json();
        setRegError(errBody.error || 'This Roll Number is already registered for this event.');
        return; // Stop — do not show success pass
      }

      if (!regRes.ok) {
        const errBody = await regRes.json().catch(() => ({}));
        setRegError(errBody.error || 'Registration failed. Please try again.');
        return;
      }
    } catch {
      // Backend offline — still allow local registration with a warning
      console.warn('Backend unreachable — saving registration locally only.');
    }

    // 2. Save to local storage for persistence across tabs
    const existing = JSON.parse(localStorage.getItem('sit_user_registrations') || '[]');
    existing.unshift(newRegistration);
    localStorage.setItem('sit_user_registrations', JSON.stringify(existing));

    setRegisteredSuccess(newRegistration);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <section className="hero-wrapper">
        <div className="hero-pill">
          <i className="fa-solid fa-sparkles"></i> SIT Continuous Assessment 3 • Live Portal
        </div>
        <h1 className="hero-title">
          Where SIT Innovators <br />
          <span className="gradient-text">Build, Hack & Triumph</span>
        </h1>
        <p className="hero-subtitle">
          The central ecosystem to discover technical hackathons, join competitive programming contests, 
          and track team participation across SIT departments.
        </p>

        {/* STATS ROW */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">12+</div>
            <div className="stat-label">Active Hackathons</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹5.2L</div>
            <div className="stat-label">Total Prize Pool</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1,840+</div>
            <div className="stat-label">Student Hackers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">100%</div>
            <div className="stat-label">Verified Badges</div>
          </div>
        </div>

        {/* FLAGSHIP COUNTDOWN BANNER */}
        <Header />
      </section>

      {/* FILTER & SEARCH */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div className="search-wrapper">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search by event title, tech stack (AI, Web3, DSA) or club..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* EVENTS GRID */}
      <section className="events-grid">
        {filteredEvents.map((evt) => {
          const filledPercentage = Math.round((evt.registeredTeams / evt.maxTeams) * 100);

          return (
            <div key={evt.id} className="event-card">
              {/* Card Banner */}
              <div 
                className="card-banner"
                style={{
                  background: evt.category === 'Hackathons'
                    ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.4), rgba(147, 51, 234, 0.3)), url("/assets/hero.png")'
                    : evt.category === 'Coding Contests'
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(59, 130, 246, 0.3))'
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(236, 72, 153, 0.3))'
                }}
              >
                <span className={`badge-status ${evt.badgeClass}`}>
                  <i className="fa-solid fa-bolt"></i> {evt.badge}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: '8px' }}>
                  <i className="fa-solid fa-users"></i> {evt.teamSize}
                </span>
              </div>

              {/* Card Body */}
              <div className="card-body-custom">
                <div className="event-category-tag">{evt.category} • {evt.organizer}</div>
                <h3 className="event-card-title">{evt.title}</h3>

                <div className="event-meta-row">
                  <span className="meta-item">
                    <i className="fa-regular fa-calendar" style={{ color: '#818cf8' }}></i> {evt.date}
                  </span>
                  <span className="meta-item">
                    <i className="fa-regular fa-clock" style={{ color: '#06b6d4' }}></i> {evt.time}
                  </span>
                  <span className="meta-item">
                    <i className="fa-solid fa-location-dot" style={{ color: '#ec4899' }}></i> {evt.venue}
                  </span>
                </div>

                <p className="event-description">{evt.desc}</p>

                {/* Tech Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {evt.tags.map(t => (
                    <span key={t} style={{
                      fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)',
                      padding: '3px 8px', borderRadius: '6px', color: '#cbd5e1'
                    }}>
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Prize Pool */}
                <div className="prize-pool-box">
                  <span className="prize-label">
                    <i className="fa-solid fa-award"></i> Total Reward Pool
                  </span>
                  <span className="prize-amount">{evt.prize}</span>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>Slots Filled</span>
                    <span><strong>{evt.registeredTeams}</strong> / {evt.maxTeams} Teams</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${filledPercentage}%`, height: '100%',
                      background: filledPercentage > 85 ? '#ef4444' : 'linear-gradient(90deg, #6366f1, #06b6d4)',
                      borderRadius: '999px'
                    }}></div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="card-footer-custom">
                  <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                    <i className="fa-solid fa-check"></i> Free Entry
                  </span>
                  <button 
                    className="btn-nexus-primary"
                    onClick={() => handleOpenRegister(evt)}
                  >
                    Register Team <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* WHY PARTICIPATE / PERKS */}
      <MainContent />

      {/* REGISTRATION MODAL */}
      {activeModalEvent && (
        <div className="custom-modal-backdrop" onClick={handleCloseModal}>
          <div className="custom-modal-card" onClick={e => e.stopPropagation()}>
            {!registeredSuccess ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <span className="event-category-tag">{activeModalEvent.category}</span>
                    <h3 style={{ fontSize: '1.35rem', margin: '4px 0 0' }}>Register for {activeModalEvent.title}</h3>
                  </div>
                  <button 
                    onClick={handleCloseModal}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>

                {isAuthenticated ? (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '10px',
                      padding: '9px 14px',
                      marginBottom: '1.2rem',
                      fontSize: '0.84rem',
                      color: '#6ee7b7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="fa-solid fa-circle-check text-success"></i>
                    <span>
                      Logged in as <strong>{user?.name}</strong> ({user?.rollNumber || user?.email}). Leader details pre-filled!
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      borderRadius: '10px',
                      padding: '9px 14px',
                      marginBottom: '1.2rem',
                      fontSize: '0.84rem',
                      color: '#a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}
                  >
                    <span>
                      <i className="fa-solid fa-circle-info me-1"></i> Have an SIT Nexus profile?
                    </span>
                    <Link to="/login" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600 }}>
                      Sign In to auto-fill
                    </Link>
                  </div>
                )}

                {regError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '10px',
                    padding: '9px 14px',
                    marginBottom: '1rem',
                    fontSize: '0.84rem',
                    color: '#fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitRegistration}>
                  <label className="form-label-custom">Team Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CodeCraft Innovators"
                    className="form-control-custom"
                    value={formData.teamName}
                    onChange={e => setFormData({ ...formData, teamName: e.target.value })}
                  />

                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label-custom">Team Leader Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        className="form-control-custom"
                        value={formData.leaderName}
                        onChange={e => setFormData({ ...formData, leaderName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label-custom">SIT Roll Number *</label>
                      <input
                        type="text"
                        required
                        className="form-control-custom"
                        value={formData.rollNumber}
                        onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-8">
                      <label className="form-label-custom">College Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. student@sit.edu"
                        className="form-control-custom"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Team Size</label>
                      <select
                        className="form-control-custom"
                        value={formData.teamSize}
                        onChange={e => setFormData({ ...formData, teamSize: e.target.value })}
                      >
                        <option value="1">1 Member</option>
                        <option value="2">2 Members</option>
                        <option value="3">3 Members</option>
                        <option value="4">4 Members</option>
                      </select>
                    </div>
                  </div>

                  <label className="form-label-custom">Brief Project Idea / Focus Track (Optional)</label>
                  <textarea
                    rows="2"
                    placeholder="What problem statement or technology stack will you be building?"
                    className="form-control-custom"
                    value={formData.projectIdea}
                    onChange={e => setFormData({ ...formData, projectIdea: e.target.value })}
                  ></textarea>

                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <button type="button" className="btn-nexus-outline" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-nexus-primary">
                      <i className="fa-solid fa-check"></i> Complete Registration
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* SUCCESS PASS VIEW */
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)', color: '#34d399',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', margin: '0 auto 1.25rem',
                  border: '2px solid rgba(16, 185, 129, 0.5)'
                }}>
                  <i className="fa-solid fa-check"></i>
                </div>

                <h3 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Registration Confirmed!</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Your team pass has been generated and recorded for SIT-CA-03.
                </p>

                {/* Digital Ticket */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px dashed rgba(99, 102, 241, 0.5)',
                  borderRadius: '16px', padding: '1.25rem',
                  textAlign: 'left', marginBottom: '1.5rem'
                }}>
                  <div className="d-flex justify-content-between mb-2">
                    <strong style={{ color: '#818cf8', fontSize: '0.82rem' }}>OFFICIAL EVENT PASS</strong>
                    <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>VERIFIED</span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', margin: '4px 0 8px', color: '#fff' }}>
                    {registeredSuccess.eventTitle}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                    <div><strong>Pass ID:</strong> <code>{registeredSuccess.id}</code></div>
                    <div><strong>Team Name:</strong> {registeredSuccess.teamName} ({registeredSuccess.teamSize} members)</div>
                    <div><strong>Team Leader:</strong> {registeredSuccess.leaderName} (Roll: {registeredSuccess.rollNumber})</div>
                    <div><strong>Date & Venue:</strong> {registeredSuccess.eventDate} • {registeredSuccess.venue}</div>
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-2">
                  <a href="/services" className="btn-nexus-primary">
                    <i className="fa-solid fa-list-check"></i> View My Registrations
                  </a>
                  <button className="btn-nexus-outline" onClick={handleCloseModal}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;
