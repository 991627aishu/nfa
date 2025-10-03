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

app.use('/generated_letters', express.static(path.join(__dirname, 'uploads', 'generated_letters'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.docx')) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// Serve uploads folder (for header.png, signatures, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/' + path.extname(filePath).substring(1));
    }
  }
}));

// Serve static files from the main directory (for HTML files)
app.use(express.static(path.join(__dirname, '..')));

// Serve the NFA document generator HTML file
app.get('/nfa-document-generator.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'nfa-document-generator.html'));
});

// Serve the test server HTML file
app.get('/test-server.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test-server.html'));
});

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is healthy 🚀" });
});

// ✅ NFA Generation API endpoint
app.post("/api/generate-nfa", async (req, res) => {
  console.log("📝 NFA Generation API called");
  
  try {
    const { subject, summary, nfaType, needBullets, tableData } = req.body;
    
    console.log("📝 NFA Generation inputs:", { subject, summary, nfaType, needBullets, tableData });
    
    if (!subject || !summary) {
      return res.status(400).json({
        success: false,
        error: "Subject and summary are required"
      });
    }
    
    // Prepare Python script arguments
    const pythonScript = path.join(__dirname, 'python', 'generate_nfa_automation_fixed.py');
    const bulletsArg = needBullets ? 'yes' : 'no';
    const tableDataJson = JSON.stringify(tableData || []);
    
    const args = [pythonScript, subject, summary, nfaType, bulletsArg, tableDataJson];
    
    console.log("🐍 Running Python script with args:", args);
    
    // Try different Python commands
    const pythonCommands = ['python', 'python3', 'py'];
    let pythonProcess = null;
    let pythonCommand = null;
    
    for (const cmd of pythonCommands) {
      try {
        pythonProcess = spawn(cmd, args, {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        pythonCommand = cmd;
        break;
      } catch (error) {
        console.log(`❌ Failed to spawn with ${cmd}:`, error.message);
        continue;
      }
    }
    
    if (!pythonProcess) {
      throw new Error('Could not spawn Python process with any command');
    }
    
    console.log(`✅ Python process spawned with command: ${pythonCommand}`);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python process exited with code: ${code}`);
      console.log(`📤 Python stdout: ${stdout}`);
      console.log(`📤 Python stderr: ${stderr}`);
      
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          console.log("✅ NFA generation successful:", result);
          res.json(result);
        } catch (parseError) {
          console.error("❌ Failed to parse Python output:", parseError);
          res.status(500).json({
            success: false,
            error: "Failed to parse Python script output"
          });
        }
      } else {
        console.error("❌ Python script failed with code:", code);
        res.status(500).json({
          success: false,
          error: `Python script failed: ${stderr || 'Unknown error'}`
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error("❌ Python process error:", error);
      res.status(500).json({
        success: false,
        error: `Python process error: ${error.message}`
      });
    });
    
  } catch (error) {
    console.error("❌ NFA generation API error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
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

// ✅ Generate Job Recommendation Letter using Python script with fallback
app.post("/api/generate-job-recommendation", (req, res) => {
  console.log("📝 Generate Job Recommendation request received:", req.body);
  
  const { name, title, summary } = req.body;
  
  // Fallback response for generation mode
  const createGenerationFallbackResponse = () => {
    const fallbackContent = `Letter of Recommendation

Dr. Phani Kumar Pullela
Professor & Associate Dean
RV University
Email: phanikumarp@rvu.edu.in
Phone: +91-9902005868

Subject: Job Recommendation Letter for ${name}

To Whomsoever It May Concern

It is my privilege to recommend ${name}, who has consistently demonstrated dedication and expertise in their work. I have had the pleasure of mentoring ${name}, and their significant contributions to "${title}" have been truly commendable.

${name} has demonstrated exceptional skills and dedication in their project '${title}'. ${summary}

In addition to their technical expertise, ${name} has shown exceptional professionalism, teamwork, and the ability to manage complex tasks with precision. Their commitment to excellence makes them a standout individual who will undoubtedly excel in any professional endeavor.

I am confident that ${name} will bring the same level of passion, innovation, and excellence to their future roles. Should you require additional information, please do not hesitate to contact me at +91-9902005868 or via email at phanikumarp@rvu.edu.in.

Sincerely,

Dr. Phani Kumar Pullela
Professor & Associate Dean
RV University`;

    return {
      success: true,
      content: fallbackContent,
      message: "Job recommendation letter generated successfully (fallback mode - Python unavailable)"
    };
  };
  
  try {
    const pythonScript = path.join(__dirname, 'python', 'generate_job_reco.py');
    const args = [name, title, summary];
    
    console.log("🐍 Running Python script for job recommendation:", pythonScript, "with args:", args);
    
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
        console.log(`⚠️ ${cmd} not available for job recommendation, trying next...`);
        continue;
      }
    }
    
    if (!pythonProcess) {
      throw new Error('Python not found for job recommendation. Tried: python3, python, py');
    }
    
    console.log(`🐍 Using Python command for job recommendation: ${pythonCommand}`);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python job recommendation script exited with code: ${code}`);
      console.log("📤 Python stdout:", stdout);
      console.log("📤 Python stderr:", stderr);
      
      if (code === 0) {
        try {
          // For job recommendation, we need to generate content and return it
          const filePath = stdout.trim();
          console.log("✅ Job recommendation file created:", filePath);
          
          // Generate the content that would be in the document (concise for single page)
          const content = `Letter of Recommendation

Dr. Phani Kumar Pullela
Professor & Associate Dean
RV University
Email: phanikumarp@rvu.edu.in
Phone: +91-9902005868

Subject: Job Recommendation Letter for ${name}

To Whomsoever It May Concern

It is my privilege to recommend ${name}, who has consistently demonstrated dedication and expertise in their work. I have had the pleasure of mentoring ${name}, and their significant contributions to "${title}" have been truly commendable.

${name} has demonstrated exceptional skills and dedication in their project '${title}'. ${summary}

In addition to their technical expertise, ${name} has shown exceptional professionalism, teamwork, and the ability to manage complex tasks with precision. Their commitment to excellence makes them a standout individual who will undoubtedly excel in any professional endeavor.

I am confident that ${name} will bring the same level of passion, innovation, and excellence to their future roles. Should you require additional information, please do not hesitate to contact me at +91-9902005868 or via email at phanikumarp@rvu.edu.in.

Sincerely,

Dr. Phani Kumar Pullela
Professor & Associate Dean
RV University`;

          res.json({
            success: true,
            content: content,
            message: "Job recommendation letter generated successfully",
            filePath: filePath
          });
        } catch (parseError) {
          console.error("❌ Error processing Python job recommendation output:", parseError);
          res.status(500).json({ 
            success: false, 
            error: "Failed to process Python script output",
            details: parseError.message 
          });
        }
      } else {
        console.error("❌ Python job recommendation script failed with code:", code);
        console.log("🔄 Python job recommendation failed, trying fallback response...");
        const fallbackResponse = createGenerationFallbackResponse();
        res.json(fallbackResponse);
      }
    });
    
  } catch (error) {
    console.error("❌ Error running Python job recommendation script:", error);
    console.log("🔄 Python job recommendation error, trying fallback response...");
    const fallbackResponse = createGenerationFallbackResponse();
    res.json(fallbackResponse);
  }
});

// ✅ Download Job Recommendation Letter using Python script with fallback
app.post("/api/download-job-recommendation", (req, res) => {
  console.log("📥 Download Job Recommendation request received:", req.body);
  
  const { name, title, summary, content } = req.body;
  
  try {
    const pythonScript = path.join(__dirname, 'python', 'generate_job_reco.py');
    const args = [name, title, summary];
    
    console.log("🐍 Running Python script for job recommendation download:", pythonScript, "with args:", args);
    
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
        console.log(`⚠️ ${cmd} not available for job recommendation download, trying next...`);
        continue;
      }
    }
    
    if (!pythonProcess) {
      throw new Error('Python not found for job recommendation download. Tried: python3, python, py');
    }
    
    console.log(`🐍 Using Python command for job recommendation download: ${pythonCommand}`);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python job recommendation download script exited with code: ${code}`);
      console.log("📤 Python stdout:", stdout);
      console.log("📤 Python stderr:", stderr);
      
      if (code === 0) {
        try {
          const filePath = stdout.trim();
          const fullPath = path.join(__dirname, filePath);
          
          console.log("✅ Job recommendation file ready for download:", fullPath);
          
          // Check if file exists
          if (fs.existsSync(fullPath)) {
            res.download(fullPath, (err) => {
              if (err) {
                console.error("❌ Error downloading job recommendation file:", err);
                res.status(500).json({ 
                  success: false, 
                  error: "Failed to download file",
                  details: err.message 
                });
              } else {
                console.log("✅ Job recommendation file downloaded successfully");
              }
            });
          } else {
            console.error("❌ Job recommendation file not found:", fullPath);
            res.status(404).json({ 
              success: false, 
              error: "File not found",
              details: "Generated file could not be located" 
            });
          }
        } catch (parseError) {
          console.error("❌ Error processing Python job recommendation download output:", parseError);
          res.status(500).json({ 
            success: false, 
            error: "Failed to process Python script output",
            details: parseError.message 
          });
        }
      } else {
        console.error("❌ Python job recommendation download script failed with code:", code);
        res.status(500).json({ 
          success: false, 
          error: "Failed to generate job recommendation document",
          details: "Python script execution failed" 
        });
      }
    });
    
  } catch (error) {
    console.error("❌ Error running Python job recommendation download script:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to generate job recommendation document",
      details: error.message 
    });
  }
});

// ✅ Generate MS Recommendation Letter using Python script with fallback
app.post("/api/generate-ms-recommendation", (req, res) => {
  console.log("📝 Generate MS Recommendation request received:", req.body);
  
  const { name, title, summary } = req.body;
  
  // Fallback response for generation mode
  const createGenerationFallbackResponse = () => {
    const fallbackContent = `Letter of Recommendation

Dr. Phani Kumar Pullela
Professor & Associate Dean
RV University
Email: phanikumarp@rvu.edu.in
Phone: +91-9902005868

Subject: Recommendation Letter for ${name}

To Whomsoever It May Concern

I am writing to wholeheartedly recommend ${name} for admission to your esteemed Master's program. Having had the privilege of working closely with ${name} during their academic journey at RV University, I can confidently attest to their exceptional academic abilities, strong work ethic, and potential for success in graduate studies.

Their significant contributions to "${title}" have been commendable. ${name} demonstrated remarkable dedication, analytical thinking, and problem-solving skills throughout the project. Their ability to work independently while also contributing effectively to team efforts has been impressive.

${name} has demonstrated exceptional skills and dedication in their project '${title}'. ${summary}

In summary, ${name} is a student of exceptional talent and dedication who would be a valuable addition to your Master's program. I have no doubt that they will excel in their graduate studies and make significant contributions to their field.

Sincerely,
Dr. Phani Kumar Pullela
Professor & Associate Dean
RV University`;

    return {
      success: true,
      content: fallbackContent,
      message: "MS recommendation letter generated successfully (fallback mode)"
    };
  };

  try {
    const pythonScript = path.join(__dirname, 'python', 'generate_ms_reco.py');
    const args = [name, title, summary];
    
    console.log("🐍 Running Python script for MS recommendation generation:", pythonScript, "with args:", args);
    
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
        console.log(`✅ Successfully started Python process with command: ${cmd}`);
        break;
      } catch (error) {
        console.log(`❌ Failed to start Python process with command: ${cmd}`, error.message);
        continue;
      }
    }
    
    if (!pythonProcess) {
      console.error("❌ Failed to start Python process with any command");
      const fallbackResponse = createGenerationFallbackResponse();
      return res.json(fallbackResponse);
    }
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('📤 Python stdout:', data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log('⚠️ Python stderr:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python process exited with code: ${code}`);
      
      if (code === 0 && output.trim()) {
        console.log("✅ Python script completed successfully");
        
        // For generation mode, we get the file path from Python output but generate our own content
        const filePath = output.trim();
        console.log("✅ MS recommendation file created:", filePath);
        
        // Generate the content that would be in the document
        const content = `Letter of Recommendation

Dr. Phani Kumar Pullela
Professor & Associate Dean
RV University
Email: phanikumarp@rvu.edu.in
Phone: +91-9902005868

Subject: Recommendation Letter for ${name}

To Whomsoever It May Concern

I am writing to wholeheartedly recommend ${name} for admission to your esteemed Master's program. Having had the privilege of working closely with ${name} during their academic journey at RV University, I can confidently attest to their exceptional academic abilities, strong work ethic, and potential for success in graduate studies.

Their significant contributions to "${title}" have been commendable. ${name} demonstrated remarkable dedication, analytical thinking, and problem-solving skills throughout the project. Their ability to work independently while also contributing effectively to team efforts has been impressive.

${name} has demonstrated exceptional skills and dedication in their project '${title}'. ${summary}

In summary, ${name} is a student of exceptional talent and dedication who would be a valuable addition to your Master's program. I have no doubt that they will excel in their graduate studies and make significant contributions to their field.

Sincerely,
Dr. Phani Kumar Pullela
Professor & Associate Dean
RV University`;
        
        res.json({
          success: true,
          content: content,
          message: "MS recommendation letter generated successfully"
        });
      } else {
        console.error("❌ Python script failed or produced no output");
        console.error("Error output:", errorOutput);
        
        // Return fallback response
        const fallbackResponse = createGenerationFallbackResponse();
        res.json(fallbackResponse);
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error("❌ Error running Python MS recommendation generation script:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate MS recommendation letter",
        details: error.message 
      });
    });
    
  } catch (error) {
    console.error("❌ Error running Python MS recommendation generation script:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to generate MS recommendation letter",
      details: error.message 
    });
  }
});

// ✅ Download MS Recommendation Letter using Python script with fallback
app.post("/api/download-ms-recommendation", (req, res) => {
  console.log("📥 Download MS Recommendation request received:", req.body);
  
  const { name, title, summary, content } = req.body;
  
  try {
    const pythonScript = path.join(__dirname, 'python', 'generate_ms_reco.py');
    const args = [name, title, summary];
    
    console.log("🐍 Running Python script for MS recommendation download:", pythonScript, "with args:", args);
    
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
        console.log(`✅ Successfully started Python process with command: ${cmd}`);
        break;
      } catch (error) {
        console.log(`❌ Failed to start Python process with command: ${cmd}`, error.message);
        continue;
      }
    }
    
    if (!pythonProcess) {
      console.error("❌ Failed to start Python process with any command");
      return res.status(500).json({ 
        success: false, 
        error: "Failed to generate MS recommendation document" 
      });
    }
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('📤 Python stdout:', data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.log('⚠️ Python stderr:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`🐍 Python process exited with code: ${code}`);
      
      if (code === 0 && output.trim()) {
        console.log("✅ Python script completed successfully");
        
        // For download mode, we expect the script to output the file path
        const filePath = output.trim();
        console.log("📁 Generated file path:", filePath);
        
        const fullPath = path.join(__dirname, filePath);
        console.log("📁 Full file path:", fullPath);
        
        if (fs.existsSync(fullPath)) {
          console.log("✅ File exists, sending to client");
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
          res.setHeader('Content-Disposition', `attachment; filename="MS_Recommendation_Letter_${name.replace(/\s+/g, '_')}.docx"`);
          
          const fileStream = fs.createReadStream(fullPath);
          fileStream.pipe(res);
        } else {
          console.error("❌ Generated file does not exist:", fullPath);
          res.status(500).json({ 
            success: false, 
            error: "Generated file not found",
            filePath: fullPath
          });
        }
      } else {
        console.error("❌ Python script failed or produced no output");
        console.error("Error output:", errorOutput);
        res.status(500).json({ 
          success: false, 
          error: "Failed to generate MS recommendation document",
          details: errorOutput
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error("❌ Error running Python MS recommendation download script:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate MS recommendation document",
        details: error.message 
      });
    });
    
  } catch (error) {
    console.error("❌ Error running Python MS recommendation download script:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to generate MS recommendation document",
      details: error.message 
    });
  }
});

// Start server with port conflict handling
const server = app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'downloads')}`);
  console.log(`🐍 Python script location: ${path.join(__dirname, 'python', 'generate_nfa_automation.py')}`);
  console.log(`🐍 Job recommendation script location: ${path.join(__dirname, 'python', 'generate_job_reco.py')}`);
  console.log(`🐍 MS recommendation script location: ${path.join(__dirname, 'python', 'generate_ms_reco.py')}`);
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
