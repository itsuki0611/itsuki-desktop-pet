/**
 * 簡單 HTTP 伺服器 — 在瀏覽器中執行五月桌面夥伴
 * 用法: node server.js
 * 然後打開 http://localhost:22222
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 22222;
const ROOT = path.join(__dirname, 'src', 'renderer');
const ASSETS = path.join(__dirname, 'assets');

// MIME types
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wasm': 'application/wasm',
  '.task': 'application/octet-stream',
};

// Claude API proxy
let apiKey = null;
async function loadApiKey() {
  try {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      apiKey = config.apiKey || null;
    }
  } catch (e) {}
}
async function saveApiKey(key) {
  apiKey = key;
  fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify({ apiKey: key }, null, 2));
}


async function handleClaudeChat(req, res, body) {
  if (!apiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API key not set' }));
    return;
  }

  try {
    const messages = JSON.parse(body).messages;
    const Anthropic = require('@anthropic-ai/sdk').default;
    const client = new Anthropic({ apiKey });

    const systemMsg = messages.find(m => m.role === 'system');
    const otherMsgs = messages.filter(m => m.role !== 'system');

    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: otherMsgs,
      system: systemMsg?.content,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let fullText = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
        fullText += chunk.delta.text;
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text, full: fullText })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true, text: fullText })}\n\n`);
    res.end();
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  }
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': mime,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(content);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // API routes
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => handleClaudeChat(req, res, body));
    return;
  }
  if (pathname === '/api/settings' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ apiKey: apiKey || '' }));
    return;
  }
  if (pathname === '/api/settings' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { apiKey } = JSON.parse(body);
      await saveApiKey(apiKey);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }

  // Static file serving
  let filePath;
  if (pathname.startsWith('/assets/')) {
    filePath = path.join(__dirname, pathname);
  } else if (pathname === '/') {
    filePath = path.join(ROOT, 'index.html');
  } else {
    filePath = path.join(ROOT, pathname);
  }

  serveFile(filePath, res);
});

loadApiKey().then(() => {
  server.listen(PORT, () => {
    console.log(`🎀 中野五月 桌面夥伴`);
    console.log(`   打開瀏覽器: http://localhost:${PORT}`);
    console.log(`   API Key: ${apiKey ? '已設定 ✓' : '請先設定（在網頁中輸入）'}`);
  });
});
