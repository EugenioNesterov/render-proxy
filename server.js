const http = require('http');
const httpProxy = require('http-proxy');
const https = require('https');

const proxy = httpProxy.createProxyServer({
    target: 'https://clob.polymarket.com',
    changeOrigin: true,
    secure: true,
    xfwd: false
});

const server = http.createServer((req, res) => {
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('pong');
        return;
    }

    if (req.url === '/myip') {
        https.get('https://api.ipify.org?format=json', (ipRes) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            ipRes.pipe(res);
        }).on('error', (e) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        });
        return;
    }

    delete req.headers['x-forwarded-for'];
    delete req.headers['x-forwarded-proto'];
    delete req.headers['x-forwarded-host'];
    delete req.headers['x-real-ip'];
    delete req.headers['cf-connecting-ip'];
    delete req.headers['cf-ipcountry'];

    proxy.web(req, res, {}, (err) => {
        console.error('Proxy error:', err.message);
        if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Proxy bad gateway', details: err.message }));
        }
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Render proxy listening on port ${PORT}`);
});
