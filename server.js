const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    // Пинг, чтобы сервер не спал
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('pong');
        return;
    }

    proxy.web(req, res, { target: req.url, secure: false }, (err) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Proxy error: ' + err.message);
    });
});

// Обработка HTTPS (CONNECT)
server.on('connect', (req, clientSocket, head) => {
    const { port, hostname } = new URL(`http://${req.url}`);
    const net = require('net');
    
    const serverSocket = net.connect(port || 443, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', () => clientSocket.end());
    clientSocket.on('error', () => serverSocket.end());
});

server.listen(port, () => {
    console.log(`Proxy running on port ${port}`);
});
