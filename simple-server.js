const express = require('express');
const path = require('path');
const app = express();
const PORT = 3002;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve HTML files with proper MIME type
app.get('*.html', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

// Default route - serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'nfa-document-generator-fixed.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple server running on http://localhost:${PORT}`);
    console.log(`📄 NFA Document Generator: http://localhost:${PORT}/nfa-document-generator-fixed.html`);
    console.log(`🧪 Test page: http://localhost:${PORT}/test-simple.html`);
    console.log(`📝 Original page: http://localhost:${PORT}/nfa-document-generator.html`);
    console.log('Press Ctrl+C to stop the server');
});

// Handle server errors
app.on('error', (error) => {
    console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});
