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

// Contact Form Handler
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message, timestamp } = req.body;

    // 입력값 검증
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }

    // 환경변수에서 수신 이메일 가져오기 (로직에 노출 X)
    const contactEmail = process.env.CONTACT_EMAIL;

    // 문의 정보 저장
    const contactData = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      timestamp: timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString()
    };

    // 💾 로그: 민감한 정보 노출 안 함
    console.log('📧 새 문의 수신:', {
      senderName: contactData.name,
      senderEmail: contactData.email,
      subject: contactData.subject,
      timestamp: contactData.timestamp
    });

    // 📧 실제 환경에서 이메일 전송 (현재는 주석처리)
    // if (contactEmail) {
    //   // nodemailer 또는 SendGrid 등을 사용하여 이메일 전송
    //   // await sendEmailToAdmin(contactEmail, contactData);
    //   console.log(`✉️ 이메일 발송됨: ${contactEmail}`);
    // }

    // 🗄️ Firebase에 문의 저장 (선택사항)
    // await saveContactToFirebase(contactData);

    // 성공 응답
    res.json({
      status: 'success',
      message: 'Contact message received. We will reply soon.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// ===== Admin 검증 =====

// Admin check (보안: 서버에서만 처리)
app.post('/api/checkAdmin', (req, res) => {
  try {
    const { email } = req.body;
    const adminEmail = process.env.VITE_ADMIN_EMAIL;

    // 서버에서만 admin 이메일 비교
    const isAdmin = email && adminEmail && email === adminEmail;

    // 디버그 로그
    console.log('🔍 Admin check:', {
      receivedEmail: email,
      adminEmail: adminEmail,
      isAdmin: isAdmin,
      match: email === adminEmail
    });

    res.json({
      isAdmin: isAdmin,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Admin check error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin 미들웨어: 모든 /api/admin/* 요청 검증
app.use('/api/admin/', (req, res, next) => {
  try {
    const { email } = req.body;
    const adminEmail = process.env.VITE_ADMIN_EMAIL;

    if (!email || !adminEmail || email !== adminEmail) {
      return res.status(403).json({
        error: { message: 'Unauthorized: Admin access required' },
        isAdmin: false
      });
    }

    // Admin 확인 완료, 다음 핸들러로
    next();
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin 통계 조회 (관리자 전용)
app.post('/api/admin/stats', (req, res) => {
  try {
    const { email } = req.body;
    // 미들웨어에서 이미 검증됨

    // 테스트용 응답 (실제로는 Firebase getAdminStats() 호출)
    res.json({
      totalUsers: 0,
      paidUsers: 0,
      freeUsers: 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin - 모든 사용자 목록 조회 (관리자 전용)
app.post('/api/admin/users', (req, res) => {
  try {
    const { email } = req.body;
    // 미들웨어에서 이미 검증됨

    // 테스트용 응답 (실제로는 Firebase getAllUsersForAdmin() 호출)
    res.json({
      users: [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Admin - 특정 사용자의 문제 세션 조회 (관리자 전용)
app.post('/api/admin/user/sessions', (req, res) => {
  try {
    const { email, userId } = req.body;
    // 미들웨어에서 이미 검증됨

    if (!userId) {
      return res.status(400).json({ error: { message: 'userId is required' } });
    }

    // 테스트용 응답 (실제로는 Firebase getUserProblemSessions() 호출)
    res.json({
      sessions: [],
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

// Start server on port 5000
const server = app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/checkAdmin`);
  console.log(`   Contact API: http://localhost:${PORT}/api/contact`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('   Try: taskkill /F /IM node.exe');
    process.exit(1);
  } else {
    console.error(`❌ Server error: ${err.message}`);
    process.exit(1);
  }
});
