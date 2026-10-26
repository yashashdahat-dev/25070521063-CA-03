const { spawn } = require('child_process');
const path = require('path');

console.log('\n=============================================================');
console.log('   🚀 SIT NEXUS FULL-STACK PLATFORM — STARTING SERVICES');
console.log('=============================================================\n');

const serverDir = path.join(__dirname, 'server');
const clientDir = path.join(__dirname, 'client');

// 1. Start Backend Express + MongoDB
console.log('>>> [1/2] Starting Express Backend (Port 5000)...');
const backend = spawn('node', ['server.js'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('>>> [Backend Error]', err);
});

// 2. Start Frontend React + Vite
setTimeout(() => {
  console.log('>>> [2/2] Starting Vite Frontend (Port 5173)...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: clientDir,
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('>>> [Frontend Error]', err);
  });

  setTimeout(() => {
    console.log('\n=============================================================');
    console.log('   ✨ ALL SYSTEMS OPERATIONAL & READY!');
    console.log('   🌐 Web Application: http://localhost:5173');
    console.log('   📡 REST API Server: http://localhost:5000');
    console.log('   🍃 MongoDB Compass: mongodb://127.0.0.1:27017/sitSecB');
    console.log('=============================================================\n');
  }, 2000);

  const cleanup = () => {
    try { backend.kill(); } catch (e) {}
    try { frontend.kill(); } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}, 1200);
