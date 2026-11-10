const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let urls = [];
let id = 1000;

function makeCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

app.get('/', (req, res) => {
  let rows = urls.map(u => `<tr><td><a href="/${u.code}" target="_blank">${req.protocol}://${req.get('host')}/${u.code}</a></td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${u.longUrl}</td><td>${u.clicks}</td><td><button onclick="navigator.clipboard.writeText('${req.protocol}://${req.get('host')}/${u.code}');alert('Copied!')">Copy</button></td></tr>`).join('') || '<tr><td colspan="4">No links yet. Create one above!</td></tr>';
  res.send(`
  <html><head><title>CodeAlpha - URL Shortener</title><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{font-family:Arial;background:#f4f6fb;padding:20px} .box{max-width:700px;margin:auto;background:#fff;padding:25px;border-radius:12px;box-shadow:0 4px 20px #0001} input{width:100%;padding:12px;margin:10px 0;border:1px solid #ddd;border-radius:8px} button{background:#2563eb;color:#fff;border:0;padding:12px 20px;border-radius:8px;cursor:pointer} table{width:100%;border-collapse:collapse;margin-top:20px} td,th{border-bottom:1px solid #eee;padding:10px;text-align:left} h1{margin:0} p{color:#666}</style></head>
  <body><div class="box"><h1>🔗 CodeAlpha URL Shortener</h1><p>Paste long URL, get short link. Track clicks.</p>
  <form method="POST" action="/shorten"><input name="longUrl" placeholder="https://example.com/very/long/link..." required><button>Shorten URL →</button></form>
  <h3>Your Links - Total: ${urls.length}</h3><table><tr><th>Short Link</th><th>Original URL</th><th>Clicks</th><th>Action</th></tr>${rows}</table>
  <p style="margin-top:20px;font-size:13px">Made by Rajnish | CodeAlpha Internship - Task 1</p></div></body></html>`);
});

app.post('/shorten', (req, res) => {
  let longUrl = req.body.longUrl;
  if (!longUrl.startsWith('http')) longUrl = 'https://' + longUrl;
  let code = makeCode();
  urls.push({ id: id++, code, longUrl, clicks: 0, createdAt: new Date() });
  res.redirect('/');
});

app.get('/:code', (req, res) => {
  let found = urls.find(u => u.code === req.params.code);
  if (!found) return res.status(404).send('<h2>Link not found!</h2><a href="/">Go Home</a>');
  found.clicks++;
  res.redirect(found.longUrl);
});

app.get('/api/urls', (req, res) => res.json(urls));

app.listen(PORT, () => console.log('Running on http://localhost:' + PORT));