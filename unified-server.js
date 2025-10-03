const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the main directory (for HTML files)
app.use(express.static(path.join(__dirname)));

// Serve uploads folder (for header.png, signatures, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/' + path.extname(filePath).substring(1));
    }
  }
}));

// Serve generated letters
app.use('/generated_letters', express.static(path.join(__dirname, 'uploads', 'generated_letters'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.docx')) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// Serve downloads
app.use('/downloads', express.static(path.join(__dirname, 'downloads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.docx')) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', 'attachment');
    }
  }
}));

// Specific routes for HTML files
app.get('/nfa-document-generator.html', (req, res) => {
  console.log('📄 Serving NFA Document Generator HTML');
  res.sendFile(path.join(__dirname, 'nfa-document-generator.html'));
});

app.get('/nfa-document-generator-fixed.html', (req, res) => {
  console.log('📄 Serving NFA Document Generator Fixed HTML');
  res.sendFile(path.join(__dirname, 'nfa-document-generator-fixed.html'));
});

app.get('/fa-standalone.html', (req, res) => {
  console.log('📄 Serving NFA Standalone HTML');
  res.sendFile(path.join(__dirname, 'fa-standalone.html'));
});

app.get('/test-simple.html', (req, res) => {
  console.log('📄 Serving Test Simple HTML');
  res.sendFile(path.join(__dirname, 'test-simple.html'));
});

app.get('/quick-test.html', (req, res) => {
  console.log('📄 Serving Quick Test HTML');
  res.sendFile(path.join(__dirname, 'quick-test.html'));
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Unified server is healthy 🚀', port: PORT });
});

// NFA Generation API endpoint (simplified)
app.post('/api/generate-nfa', async (req, res) => {
  console.log('📝 NFA Generation API called');
  
  try {
    const { subject, summary, nfaType, needBullets, tableData } = req.body;
    
    console.log('📝 NFA Generation inputs:', { subject, summary, nfaType, needBullets, tableData });
    
    if (!subject || !summary) {
      return res.status(400).json({
        success: false,
        message: 'Subject and summary are required'
      });
    }

    // For now, return a simple response
    res.json({
      success: true,
      message: 'NFA document generated successfully',
      data: {
        subject,
        summary,
        nfaType,
        needBullets,
        tableData
      }
    });
    
  } catch (error) {
    console.error('❌ NFA Generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating NFA document',
      error: error.message
    });
  }
});

// Default route - serve the main NFA document generator
app.get('/', (req, res) => {
  console.log('🏠 Serving default route - NFA Document Generator');
  res.sendFile(path.join(__dirname, 'nfa-document-generator.html'));
});

// Catch-all handler for React app (if needed)
app.get('*', (req, res) => {
  // If it's an API route, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  
  // For other routes, try to serve the file or redirect to main page
  const filePath = path.join(__dirname, req.path);
  if (require('fs').existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // Redirect to main page if file doesn't exist
    res.redirect('/nfa-document-generator.html');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log('🚀 Unified Server Started Successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📄 NFA Document Generator: http://localhost:${PORT}/nfa-document-generator.html`);
  console.log(`🔧 Fixed Version: http://localhost:${PORT}/nfa-document-generator-fixed.html`);
  console.log(`🚀 Standalone Version: http://localhost:${PORT}/fa-standalone.html`);
  console.log(`🧪 Test Page: http://localhost:${PORT}/test-simple.html`);
  console.log(`⚡ Quick Test: http://localhost:${PORT}/quick-test.html`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All HTML files are now available on port 3002!');
  console.log('Press Ctrl+C to stop the server');
});

// Handle server errors
app.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down unified server...');
  process.exit(0);
});
