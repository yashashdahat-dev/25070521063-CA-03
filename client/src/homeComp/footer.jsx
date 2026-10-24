import React from 'react';
import '../App.css';

const Footer = () => {
  return (
    <footer className="nexus-footer">
      <div className="footer-content">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="brand-icon" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>
              <i className="fa-solid fa-code-branch"></i>
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>SIT NEXUS</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
            The official central events and hackathon management platform for SIT students and tech societies.
          </p>
          <div className="d-flex gap-3" style={{ fontSize: '1.1rem' }}>
            <a href="https://github.com/yashashdahat-dev/25070521063-CA-03" target="_blank" rel="noreferrer" style={{ color: '#94a3b8' }}>
              <i className="fa-brands fa-github"></i>
            </a>
            <a href="#discord" style={{ color: '#94a3b8' }}>
              <i className="fa-brands fa-discord"></i>
            </a>
            <a href="#linkedin" style={{ color: '#94a3b8' }}>
              <i className="fa-brands fa-linkedin"></i>
            </a>
          </div>
        </div>

        <div>
          <h4 className="footer-heading">Quick Portals</h4>
          <ul className="footer-links">
            <li><a href="/"><i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i> Browse Events</a></li>
            <li><a href="/services"><i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i> Registered Hackathons</a></li>
            <li><a href="/about"><i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i> Technical Council</a></li>
            <li><a href="/contact"><i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i> Coordinator Desk</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Active Tech Clubs</h4>
          <ul className="footer-links">
            <li><a href="#acm">ACM Student Chapter</a></li>
            <li><a href="#gdg">Google Developer Student Club</a></li>
            <li><a href="#robotics">Robotics & Automation Society</a></li>
            <li><a href="#cyber">Cyber Security & CTF Cell</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Continuous Assessment</h4>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            <strong>Assessment:</strong> SIT-CA-03<br/>
            <strong>Student Roll No:</strong> 25070521063<br/>
            <strong>Tech Stack:</strong> React + Vite + Node/Express + MongoDB
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p style={{ margin: 0 }}>
          &copy; {new Date().getFullYear()} SIT Nexus Campus Portal. Created for CA-03 Submission.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
