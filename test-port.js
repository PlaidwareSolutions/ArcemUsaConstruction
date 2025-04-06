import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Port test successful\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port 5000 is already in use');
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

server.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
  console.log('Port is available');
  process.exit(0);
});