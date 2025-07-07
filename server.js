const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 MapEase Event Management is running on port ${port}`);
  console.log(`🌐 Open http://localhost:${port} in your browser`);
  console.log(`📱 The QR scanner will work with HTTPS in production`);
});
