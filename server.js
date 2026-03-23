const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Claude API 프록시 핸들러
async function handleClaudeProxy(req, res) {
  try {
    const { model, max_tokens, messages } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY not found in environment');
      return res.status(400).json({ error: { message: 'ANTHROPIC_API_KEY not found' } });
    }

    console.log('📤 Sending request to Claude API:', { model, max_tokens });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Claude API Error:', error);
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    console.log('✅ Claude API Success');
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
}

// 양쪽 엔드포인트 지원
app.post('/api/claude', handleClaudeProxy);
app.post('/api/claudeProxy', handleClaudeProxy);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/claude`);
});
