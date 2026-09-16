const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
    target: 'https://clob.polymarket.com',
    changeOrigin: true,
    secure: true
});

const port = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('pong');
        return;
    }

    proxy.web(req, res, {}, (err) => {
        console.error('Proxy error:', err);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
    });
});

server.listen(port, () => {
    console.log(`Polymarket reverse proxy running on port ${port}`);
});
