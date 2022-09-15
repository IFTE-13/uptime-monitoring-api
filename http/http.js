const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.write('hello programmers');
        res.end();
    } else if (req.url === '/about') {
        res.write('tell about yourself');
        res.end();
    } else {
        res.write('not found');
        res.end();
    }
});

// server.on('connection', () => {
// console.log('new connection');
// });

server.listen(3000);

console.log('Server running at 3000');
