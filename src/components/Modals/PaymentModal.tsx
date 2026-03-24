import React, { useState } from 'react';
import { useLocale } from '../../LocaleContext';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  userEmail?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSuccess, userEmail }) => {
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(userEmail || '');

  const labels = {
    ko: {
      title: '💳 프리미엄 구독',
      priceLabel: '월 $14.99',
      features: ['✅ 하루 20개 무제한 문제 생성', '✅ 모든 난이도 (중급, 상급, 도전)', '✅ 완전히 광고 없음'],
      fullNameLabel: '이름',
      emailLabel: '이메일',
      cardLabel: '카드 정보',
      subscribeBtn: '구독하기 ($14.99/월)',
      cancelBtn: '취소',
      processing: '처리 중...',
      errorMessage: '결제에 실패했습니다. 다시 시도해주세요.',
      successMessage: '구독 완료되었습니다! 감사합니다.',
    },
    en: {
      title: '💳 Premium Subscription',
      priceLabel: '$14.99 per month',
      features: ['✅ Unlimited 20 problems per day', '✅ All difficulty levels (Medium, Hard, Challenge)', '✅ Completely ad-free'],
      fullNameLabel: 'Full Name',
      emailLabel: 'Email',
      cardLabel: 'Card Information',
      subscribeBtn: 'Subscribe ($14.99/month)',
      cancelBtn: 'Cancel',
      processing: 'Processing...',
      errorMessage: 'Payment failed. Please try again.',
      successMessage: 'Subscription successful! Thank you.',
    },
    ja: {
      title: '💳 プレミアム購読',
      priceLabel: '月$14.99',
      features: ['✅ 1日20問の無制限生成', '✅ すべての難易度 (中級、上級、チャレンジ)', '✅ 完全に広告なし'],
      fullNameLabel: '名前',
      emailLabel: 'メールアドレス',
      cardLabel: 'カード情報',
      subscribeBtn: '購読する ($14.99/月)',
      cancelBtn: 'キャンセル',
      processing: '処理中...',
      errorMessage: '支払いに失敗しました。もう一度お試しください。',
      successMessage: '購読が完了しました！ありがとうございます。',
    },
  };

  const currentLabels = labels[locale as keyof typeof labels] || labels.en;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) {
      setError(locale === 'ko' ? '이름과 이메일을 입력해주세요.' : locale === 'ja' ? '名前とメールアドレスを入力してください。' : 'Please enter your name and email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stripe = (window as any).Stripe;
      if (!stripe) {
        throw new Error('Stripe library not loaded');
      }

      const stripeInstance = stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

      // Create payment intent on backend
      const env = (import.meta as any).env;
      const backendUrl = env?.VITE_BACKEND_URL || 'http://localhost:5000';

      const response = await fetch(`${backendUrl}/api/createPaymentIntent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          fullName: fullName,
          amount: 1499, // $14.99 in cents
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const confirmPaymentResult = await stripeInstance.confirmCardPayment(clientSecret);

      if (confirmPaymentResult.error) {
        throw new Error(confirmPaymentResult.error.message);
      }

      if (confirmPaymentResult.paymentIntent.status === 'succeeded') {
        // Save user premium status
        localStorage.setItem('userStatus', 'paid');
        localStorage.setItem('premiumEndDate', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

        if (onSuccess) {
          onSuccess();
        }

        // Show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(currentLabels.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>{currentLabels.title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '24px',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Price */}
        <div style={{
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
            {currentLabels.priceLabel}
          </div>
          <div style={{ color: '#6366f1', fontSize: '28px', fontWeight: 'bold' }}>
            $14.99<span style={{ fontSize: '16px', color: '#94a3b8' }}> / {locale === 'ko' ? '월' : locale === 'ja' ? '月' : 'month'}</span>
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '24px' }}>
          {currentLabels.features.map((feature, idx) => (
            <div key={idx} style={{ color: '#cbd5e1', marginBottom: '8px', fontSize: '14px' }}>
              {feature}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handlePayment}>
          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '6px' }}>
              {currentLabels.fullNameLabel}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={currentLabels.fullNameLabel}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '6px' }}>
              {currentLabels.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={currentLabels.emailLabel}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
              disabled={loading}
            />
          </div>

          {/* Card Element */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '6px' }}>
              {currentLabels.cardLabel}
            </label>
            <div style={{
              padding: '10px 12px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: '#cbd5e1',
              fontSize: '14px',
            }}>
              <p style={{ margin: 0, marginBottom: '8px', fontWeight: 'bold' }}>
                {locale === 'ko' ? '테스트 카드' : locale === 'ja' ? 'テストカード' : 'Test Card'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
                {locale === 'ko' ? '번호: 4242 4242 4242 4242\nCVC: 123\n유효기간: 12/25' : locale === 'ja' ? '番号: 4242 4242 4242 4242\nCVC: 123\n有効期限: 12/25' : 'Number: 4242 4242 4242 4242\nCVC: 123\nExpiry: 12/25'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '12px',
              color: '#fca5a5',
              fontSize: '14px',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#cbd5e1',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontWeight: '500',
              }}
            >
              {currentLabels.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#6366f1',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontWeight: '600',
              }}
            >
              {loading ? currentLabels.processing : currentLabels.subscribeBtn}
            </button>
          </div>
        </form>

        {/* Test Mode Notice */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'rgba(147, 112, 219, 0.1)',
          border: '1px solid rgba(147, 112, 219, 0.3)',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#d8b4fe',
          textAlign: 'center',
        }}>
          {locale === 'ko' ? '🧪 테스트 모드: 결제 로직이 시뮬레이션됩니다.' : locale === 'ja' ? '🧪 テストモード: 支払いロジックはシミュレートされます。' : '🧪 Test Mode: Payment logic is simulated.'}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
