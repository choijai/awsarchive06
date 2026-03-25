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

// Payment Intent Handler (Stripe)
app.post('/api/createPaymentIntent', async (req, res) => {
  try {
    const { email, fullName, amount, currency } = req.body;

    // 테스트 모드: 실제 Stripe 통합 전 시뮬레이션
    // 프로덕션: Stripe SDK 필요
    const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      // 테스트 모드: 더미 clientSecret 반환
      const dummyClientSecret = `pi_test_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

      return res.json({
        clientSecret: dummyClientSecret,
        status: 'test_mode',
        message: 'Test mode: Payment intent created (simulated)'
      });
    }

    // 프로덕션에서는 실제 Stripe API 호출
    // const stripe = require('stripe')(stripeSecretKey);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount,
    //   currency: currency,
    //   metadata: { email, fullName }
    // });

    res.json({
      clientSecret: dummyClientSecret,
      status: 'success',
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Error Notification Handler
app.post('/api/notifyError', async (req, res) => {
  try {
    const { to, subject, error, apiType, timestamp, difficulty, services, locale } = req.body;

    // 테스트 모드: 에러 로깅만 수행
    const errorLog = {
      to,
      subject,
      error,
      apiType,
      timestamp,
      difficulty,
      services,
      locale,
      receivedAt: new Date().toISOString()
    };

    // 실제 환경에서는 Firebase Cloud Function이나 이메일 서비스 호출
    // console.log('📧 Error notification:', errorLog);

    res.json({
      status: 'logged',
      message: 'Error notification logged'
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin check (보안: 서버에서만 처리)
app.post('/api/checkAdmin', (req, res) => {
  try {
    const { email } = req.body;
    const adminEmail = process.env.VITE_ADMIN_EMAIL;

    // 서버에서만 admin 이메일 비교
    const isAdmin = email && adminEmail && email === adminEmail;

    res.json({
      isAdmin: isAdmin,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

app.listen(PORT, () => {
  // console.log(`✅ Proxy server running on http://localhost:${PORT}`);
  // console.log(`   API: http://localhost:${PORT}/api/claude`);
});
