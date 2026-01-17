const http = require('http');

// Heroku sets the PORT dynamically
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Welcome to our parish.');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
