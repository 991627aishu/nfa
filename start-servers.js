const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting NFA Document Generator...');

// Kill processes on ports first
console.log('🔍 Cleaning ports 5000 and 3002...');
const killPorts = require('./kill-ports.js');
killPorts.killPorts().then(() => {
  console.log('✅ Port cleanup completed, starting servers...');
  
  // Start backend server
  const backendPath = path.join(__dirname, 'backend', 'server.js');
  console.log('📡 Starting backend server...');
  const backend = spawn('node', [backendPath], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  backend.on('error', (error) => {
    console.error('❌ Backend server error:', error);
  });

  // Start frontend server after a short delay
  setTimeout(() => {
    console.log('🎨 Starting frontend server...');
    const frontend = spawn('npm', ['start'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    frontend.on('error', (error) => {
      console.error('❌ Frontend server error:', error);
    });

    frontend.on('close', (code) => {
      console.log(`Frontend server exited with code ${code}`);
    });
  }, 3000);

  backend.on('close', (code) => {
    console.log(`Backend server exited with code ${code}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    process.exit(0);
  });
});
