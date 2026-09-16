const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
    target: 'https://clob.polymarket.com',
    changeOrigin: true,
    secure: true,
    xfwd: false
});

const server = http.createServer((req, res) => {
    delete req.headers['x-forwarded-for'];
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
