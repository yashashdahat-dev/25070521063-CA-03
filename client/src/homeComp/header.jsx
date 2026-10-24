import React, { useState, useEffect } from 'react';
import '../App.css';

const Header = () => {
  // Target date: HackSIT 2026 in 14 days
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 8,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="countdown-banner">
      <div>
        <span className="badge-status badge-live" style={{ marginBottom: '8px', display: 'inline-block' }}>
          <i className="fa-solid fa-circle fa-fade"></i> FLAGSHIP EVENT
        </span>
        <h3 style={{ margin: '4px 0 6px', fontSize: '1.5rem' }}>
          HackSIT 2026 — 36-Hour National Hackathon
        </h3>
        <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>
          <i className="fa-regular fa-calendar"></i> Nov 14-16, 2026 &nbsp;|&nbsp; 
          <i className="fa-solid fa-location-dot"></i> Central Tech Auditorium & Labs &nbsp;|&nbsp;
          <strong style={{ color: '#fbbf24' }}>₹2,50,000 Pool</strong>
        </p>
      </div>

      <div className="countdown-timer-group">
        <div className="timer-box">
          <div className="timer-value">{String(timeLeft.days).padStart(2, '0')}</div>
          <div className="timer-label">Days</div>
        </div>
        <div className="timer-box">
          <div className="timer-value">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="timer-label">Hours</div>
        </div>
        <div className="timer-box">
          <div className="timer-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="timer-label">Mins</div>
        </div>
        <div className="timer-box">
          <div className="timer-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="timer-label">Secs</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
