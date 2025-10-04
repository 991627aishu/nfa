const { exec } = require('child_process');

// Function to kill processes on specific ports (Windows)
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    console.log(`🔍 Checking for processes on port ${port}...`);
    
    // Use netstat to find processes using the port
    exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`✅ No processes found on port ${port}`);
        resolve();
        return;
      }
      
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        }
      });
      
      if (pids.size === 0) {
        console.log(`✅ No processes found on port ${port}`);
        resolve();
        return;
      }
      
      console.log(`⚠️ Found ${pids.size} process(es) on port ${port}. Killing...`);
      
      let killed = 0;
      pids.forEach(pid => {
        exec(`taskkill /F /PID ${pid}`, (killError) => {
          if (killError) {
            console.log(`⚠️ Could not kill process ${pid}: ${killError.message}`);
          } else {
            console.log(`✅ Killed process ${pid}`);
          }
          killed++;
          if (killed === pids.size) {
            console.log(`✅ Finished cleaning port ${port}`);
            resolve();
          }
        });
      });
    });
  });
}

// Main function to kill processes on both ports
async function killPorts() {
  console.log('🚀 Starting port cleanup...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    await killProcessOnPort(5000);
    await killProcessOnPort(3002);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Port cleanup completed successfully!');
    console.log('📡 Backend will run on port 5000');
    console.log('🎨 Frontend will run on port 3002');
  } catch (error) {
    console.error('❌ Error during port cleanup:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  killPorts();
}

module.exports = { killProcessOnPort, killPorts };
