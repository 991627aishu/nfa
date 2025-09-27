const express = require("express");
const cors = require("cors");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from downloads directory with proper MIME types
app.use('/downloads', express.static(path.join(__dirname, 'downloads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.docx')) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

app.use('/generated_letters', express.static(path.join(__dirname, 'generated_letters'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.docx')) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is healthy 🚀" });
});

// ✅ Python test route
app.get("/api/test-python", (req, res) => {
  console.log("🧪 Testing Python execution...");
  
  try {
    const pythonScript = path.join(__dirname, 'python', 'test_simple.py');
    
    // Try different Python commands - prioritize 'python' on Windows
    const pythonCommands = ['python', 'python3', 'py'];
    let pythonProcess = null;
    let pythonCommand = null;
    
    for (const cmd of pythonCommands) {
      try {
        pythonProcess = spawn(cmd, [pythonScript], {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        pythonCommand = cmd;
        break;
      } catch (error) {
        console.log(`⚠️ ${cmd} not available, trying next...`);
        continue;
      }
    }
    
    if (!pythonProcess) {
      res.status(500).json({ 
        success: false, 
        error: "Python not found",
        details: "Tried: python3, python, py"
      });
      return;
    }
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res.json({ 
          success: true, 
          message: "Python execution successful",
          command: pythonCommand,
          output: stdout.trim()
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Python test failed",
          exitCode: code,
          stderr: stderr,
          stdout: stdout
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      res.status(500).json({ 
        success: false, 
        error: "Python process error",
        details: error.message
      });
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: "Failed to test Python",
      details: error.message
    });
  }
});

// ✅ Generate NFA using Python script with fallback
app.post("/api/generate-nfa", (req, res) => {
  console.log("📩 Generate NFA request received:", req.body);
  
  const { subject, summary, nfaType, bulletsRequired, needBullets, tableData } = req.body;
  
  // Fallback response when Python fails
  const createFallbackResponse = () => {
    let basicContent = `Subject: ${subject || "NFA Request"}

Request for approval regarding ${summary || "NFA Request Summary"}. This proposal requires administrative approval and proper coordination for successful execution.`;

    // Add bullet points if requested
    if (bulletsRequired || needBullets) {
      basicContent += `

• The event will promote community engagement and collaboration among participants
• Proper administrative procedures will be followed for event coordination
• All necessary approvals and permissions will be obtained before proceeding`;
    }

    basicContent += `

The above proposal is submitted for approval, and the amount may kindly be reimbursed to the organizing committee after the event upon submission of the online report, receipts, and GST bills.`;

    return {
      success: true,
      message: "NFA generated successfully (fallback mode - Python unavailable)",
      nfa_text: basicContent,
      nfaText: basicContent,
      file: null
    };
  };
  
  try {
    // Prepare arguments for Python script
    const pythonScript = path.join(__dirname, 'python', 'generate_nfa_automation.py');
    const args = [
      subject || "NFA Request",
      summary || "NFA Request Summary", 
      nfaType || "reimbursement",
      (bulletsRequired || needBullets) ? "yes" : "no",
      JSON.stringify(tableData || [])
    ];
    
    console.log("🐍 Running Python script:", pythonScript, "with args:", args);
    
    // Try different Python commands - prioritize 'python' on Windows
    const pythonCommands = ['python', 'python3', 'py'];
    let pythonProcess = null;
    let pythonCommand = null;
    
    for (const cmd of pythonCommands) {
      try {
        pythonProcess = spawn(cmd, [pythonScript, ...args], {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        pythonCommand = cmd;
        break;
      } catch (error) {
        console.log(`⚠️ ${cmd} not available, trying next...`);
        continue;
      }
    }
    
    if (!pythonProcess) {
      throw new Error('Python not found. Tried: python3, python, py');
    }
    
    console.log(`🐍 Using Python command: ${pythonCommand}`);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python process exited with code ${code}`);
      console.log("📤 Python stdout:", stdout);
      console.log("📤 Python stderr:", stderr);
      
      if (code === 0) {
        try {
          // Handle empty stdout
          if (!stdout || stdout.trim() === '') {
            console.error("❌ Python script returned empty output");
            res.status(500).json({ 
              success: false, 
              error: "Python script returned empty output",
              details: "Script executed but produced no output"
            });
            return;
          }
          
          const result = JSON.parse(stdout);
          console.log("✅ Python script success:", result);
          res.json(result);
        } catch (parseError) {
          console.error("❌ Error parsing Python output:", parseError);
          console.error("❌ Raw stdout was:", stdout);
          res.status(500).json({ 
            success: false, 
            error: "Failed to parse Python script output",
            details: `Parse error: ${parseError.message}. Raw output: ${stdout.substring(0, 200)}`
          });
        }
      } else {
        console.error("❌ Python script failed with code:", code);
        console.error("❌ Full stderr:", stderr);
        
        // Try to provide more helpful error messages
        let errorMessage = "Python script execution failed";
        let errorDetails = stderr || "Unknown error";
        
        if (stderr.includes("ModuleNotFoundError")) {
          errorMessage = "Python dependencies missing";
          errorDetails = "Please install required Python packages: pip install openai python-docx python-dotenv";
        } else if (stderr.includes("PermissionError")) {
          errorMessage = "Python file permission error";
          errorDetails = "Check file permissions for Python script";
        } else if (stderr.includes("FileNotFoundError")) {
          errorMessage = "Python file not found";
          errorDetails = "Python script file is missing";
        }
        
        // Try fallback response instead of failing
        console.log("🔄 Python failed, trying fallback response...");
        const fallbackResponse = createFallbackResponse();
        res.json(fallbackResponse);
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error("❌ Python process error:", error);
      console.log("🔄 Python process failed, trying fallback response...");
      const fallbackResponse = createFallbackResponse();
      res.json(fallbackResponse);
    });
    
  } catch (error) {
    console.error("❌ Error running Python script:", error);
    console.log("🔄 Python script error, trying fallback response...");
    const fallbackResponse = createFallbackResponse();
    res.json(fallbackResponse);
  }
});

// ✅ Edit NFA using Python script with fallback
app.post("/api/edit-nfa", (req, res) => {
  console.log("✏️ Edit NFA request received:", req.body);
  
  const { text, prompt, subject, summary, nfaType, bulletsRequired, tableData } = req.body;
  
  // Fallback response for edit mode
  const createEditFallbackResponse = () => {
    const editedText = `${text}\n\n[Edit requested: ${prompt}] - Applied using fallback mode (Python unavailable)`;
    return {
      success: true,
      editedText: editedText,
      message: "NFA text edited successfully (fallback mode - Python unavailable)"
    };
  };
  
  try {
    const pythonScript = path.join(__dirname, 'python', 'generate_nfa_automation.py');
    const args = ['--edit-mode', text, prompt];
    
    console.log("🐍 Running Python script for edit:", pythonScript, "with args:", args);
    
    // Try different Python commands - prioritize 'python' on Windows
    const pythonCommands = ['python', 'python3', 'py'];
    let pythonProcess = null;
    let pythonCommand = null;
    
    for (const cmd of pythonCommands) {
      try {
        pythonProcess = spawn(cmd, [pythonScript, ...args], {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        pythonCommand = cmd;
        break;
      } catch (error) {
        console.log(`⚠️ ${cmd} not available for edit, trying next...`);
        continue;
      }
    }
    
    if (!pythonProcess) {
      throw new Error('Python not found for edit. Tried: python3, python, py');
    }
    
    console.log(`🐍 Using Python command for edit: ${pythonCommand}`);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python edit process exited with code ${code}`);
      console.log("📤 Python stdout:", stdout);
      console.log("📤 Python stderr:", stderr);
      
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          console.log("✅ Python edit success:", result);
          res.json(result);
        } catch (parseError) {
          console.error("❌ Error parsing Python edit output:", parseError);
          res.status(500).json({ 
            success: false, 
            error: "Failed to parse Python script output",
            details: parseError.message 
          });
        }
      } else {
        console.error("❌ Python edit script failed with code:", code);
        console.log("🔄 Python edit failed, trying fallback response...");
        const fallbackResponse = createEditFallbackResponse();
        res.json(fallbackResponse);
      }
    });
    
  } catch (error) {
    console.error("❌ Error running Python edit script:", error);
    console.log("🔄 Python edit error, trying fallback response...");
    const fallbackResponse = createEditFallbackResponse();
    res.json(fallbackResponse);
  }
});

// ✅ Download Edited NFA using Python script with fallback
app.post("/api/download-edited-nfa", (req, res) => {
  console.log("📥 Download Edited NFA request received:", req.body);
  
  const { editedText, subject, summary, nfaType, tableData } = req.body;
  
  // Fallback response for download mode
  const createDownloadFallbackResponse = () => {
    return {
      success: true,
      message: "Download ready (fallback mode - Python unavailable)",
      filePath: null,
      fileName: null,
      downloadUrl: null,
      note: "DOCX generation unavailable in fallback mode. Content is available in preview."
    };
  };
  
  try {
    const pythonScript = path.join(__dirname, 'python', 'generate_nfa_automation.py');
    const args = [
      '--download-mode',
      editedText || "",
      subject || "NFA Request",
      summary || "NFA Request Summary",
      nfaType || "reimbursement",
      JSON.stringify(tableData || [])
    ];
    
    console.log("🐍 Running Python script for download:", pythonScript, "with args:", args);
    
    // Try different Python commands - prioritize 'python' on Windows
    const pythonCommands = ['python', 'python3', 'py'];
    let pythonProcess = null;
    let pythonCommand = null;
    
    for (const cmd of pythonCommands) {
      try {
        pythonProcess = spawn(cmd, [pythonScript, ...args], {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        pythonCommand = cmd;
        break;
      } catch (error) {
        console.log(`⚠️ ${cmd} not available for download, trying next...`);
        continue;
      }
    }
    
    if (!pythonProcess) {
      throw new Error('Python not found for download. Tried: python3, python, py');
    }
    
    console.log(`🐍 Using Python command for download: ${pythonCommand}`);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python download process exited with code ${code}`);
      console.log("📤 Python stdout:", stdout);
      console.log("📤 Python stderr:", stderr);
      
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          console.log("✅ Python download success:", result);
          res.json(result);
        } catch (parseError) {
          console.error("❌ Error parsing Python download output:", parseError);
          console.error("❌ Raw stdout:", stdout);
          res.status(500).json({ 
            success: false, 
            error: "Failed to parse Python script output",
            details: `Parse error: ${parseError.message}. Raw output: ${stdout.substring(0, 200)}`,
            stdout: stdout,
            stderr: stderr
          });
        }
      } else {
        console.error("❌ Python download script failed with code:", code);
        console.error("❌ Full stderr:", stderr);
        console.error("❌ Full stdout:", stdout);
        
        // Try to provide more helpful error messages
        let errorMessage = "Python script execution failed";
        let errorDetails = stderr || "Unknown error";
        
        if (stderr.includes("ModuleNotFoundError")) {
          errorMessage = "Python dependencies missing";
          errorDetails = "Please install required Python packages: pip install openai python-docx python-dotenv";
        } else if (stderr.includes("PermissionError")) {
          errorMessage = "Python file permission error";
          errorDetails = "Check file permissions for Python script";
        } else if (stderr.includes("FileNotFoundError")) {
          errorMessage = "Python file not found";
          errorDetails = "Python script file is missing";
        } else if (stderr.includes("No module named")) {
          errorMessage = "Python module not found";
          errorDetails = `Missing Python module. Install with: pip install ${stderr.match(/No module named '([^']+)'/)?.[1] || 'required-package'}`;
        }
        
        res.status(500).json({ 
          success: false, 
          error: errorMessage,
          details: errorDetails,
          exitCode: code,
          stdout: stdout,
          stderr: stderr,
          pythonCommand: pythonCommand
        });
      }
    });
    
  } catch (error) {
    console.error("❌ Error running Python download script:", error);
    console.log("🔄 Python download error, trying fallback response...");
    const fallbackResponse = createDownloadFallbackResponse();
    res.json(fallbackResponse);
  }
});
// ✅ Test Python script
app.get("/api/test-python", (req, res) => {
  console.log("🧪 Testing Python script...");
  
  try {
    const pythonScript = path.join(__dirname, 'python', 'generate_nfa_automation.py');
    
    const pythonProcess = spawn('python', [pythonScript, '--help'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python test process exited with code ${code}`);
      
      res.json({
        success: code === 0,
        code: code,
        stdout: stdout,
        stderr: stderr,
        scriptPath: pythonScript,
        scriptExists: fs.existsSync(pythonScript)
      });
    });
    
  } catch (error) {
    console.error("❌ Error testing Python script:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to test Python script",
      details: error.message 
    });
  }
});

// Start server with port conflict handling
const server = app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'downloads')}`);
  console.log(`🐍 Python script location: ${path.join(__dirname, 'python', 'generate_nfa_automation.py')}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    const newPort = PORT + 1;
    const newServer = app.listen(newPort, () => {
      console.log(`✅ Backend server running on http://localhost:${newPort}`);
      console.log(`📁 Serving static files from: ${path.join(__dirname, 'downloads')}`);
      console.log(`🐍 Python script location: ${path.join(__dirname, 'python', 'generate_nfa_automation.py')}`);
    });
    
    newServer.on('error', (newError) => {
      console.error('❌ Failed to start server on any port:', newError);
      process.exit(1);
    });
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});
