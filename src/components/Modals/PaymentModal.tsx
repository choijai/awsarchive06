import React, { useState } from 'react';
import { useLocale } from '../../LocaleContext';
import { updateUserPaidStatus } from '../../firebase';
import { getCurrentUser } from '../../firebase';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  userEmail?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onSuccess, userEmail }) => {
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [isComingSoon] = useState(true); // Coming Soon 모드 활성화

  const labels = {
    ko: {
      title: '💳 프리미엄 구독',
      features: ['✅ 하루 20개 문제 생성', '✅ 매일 모의시험 (50문제, 130분)', '✅ 모든 난이도 (중급, 상급, 도전)', '✅ 완전히 광고 없음'],
      fullNameLabel: '이름',
      emailLabel: '이메일',
      cardLabel: '카드 정보',
      subscribeBtn: '구독하기 ($14.99/월)',
      cancelBtn: '취소',
      processing: '처리 중...',
      errorMessage: '결제에 실패했습니다. 다시 시도해주세요.',
      successMessage: '구독 완료되었습니다! 감사합니다.',
      comingSoonTitle: '🚀 Coming Soon',
      comingSoonDesc: '프리미엄 기능이 곧 준비됩니다!',
      comingSoonMsg: 'Paddle 결제 시스템 통합을 진행 중입니다. 더 나은 결제 경험을 제공하기 위해 준비 중입니다.',
      comingSoonBtn: '닫기',
    },
    en: {
      title: '💳 Premium Subscription',
      features: ['✅ 20 problems per day', '✅ Daily mock exam (50 questions, 130 min)', '✅ All difficulty levels (Medium, Hard, Challenge)', '✅ Completely ad-free'],
      fullNameLabel: 'Full Name',
      emailLabel: 'Email',
      cardLabel: 'Card Information',
      subscribeBtn: 'Subscribe ($14.99/month)',
      cancelBtn: 'Cancel',
      processing: 'Processing...',
      errorMessage: 'Payment failed. Please try again.',
      successMessage: 'Subscription successful! Thank you.',
      comingSoonTitle: '🚀 Coming Soon',
      comingSoonDesc: 'Premium features are coming soon!',
      comingSoonMsg: 'We are integrating the Paddle payment system. We are preparing to provide a better payment experience.',
      comingSoonBtn: 'Close',
    },
    ja: {
      title: '💳 プレミアム購読',
      features: ['✅ 1日20問生成', '✅ 毎日模擬試験 (50問、130分)', '✅ すべての難易度 (中級、上級、チャレンジ)', '✅ 完全に広告なし'],
      fullNameLabel: '名前',
      emailLabel: 'メールアドレス',
      cardLabel: 'カード情報',
      subscribeBtn: '購読する ($14.99/月)',
      cancelBtn: 'キャンセル',
      processing: '処理中...',
      errorMessage: '支払いに失敗しました。もう一度お試しください。',
      successMessage: '購読が完了しました！ありがとうございます。',
      comingSoonTitle: '🚀 Coming Soon',
      comingSoonDesc: 'プレミアム機能が近日公開予定です！',
      comingSoonMsg: 'Paddle決済システムの統合を進めています。より良い決済体験を提供するための準備を進めています。',
      comingSoonBtn: '閉じる',
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
      const env = (import.meta as any).env;
      const backendUrl = env?.VITE_BACKEND_URL || 'http://localhost:5000';

      // ✅ 2Checkout API로 결제 처리
      const response = await fetch(`${backendUrl}/api/process2CheckoutPayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          fullName: fullName,
          amount: 14.99,
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const data = await response.json();

      if (data.success) {
        // ✅ Firebase에 결제 상태 저장 (영구적)
        const user = getCurrentUser();
        if (user) {
          await updateUserPaidStatus(user.uid, true);
          console.log('✅ Premium status saved to Firebase');
        }

        // 로컬 캐시도 저장
        localStorage.setItem('userStatus', 'paid');
        localStorage.setItem('premiumEndDate', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

        if (onSuccess) {
          onSuccess();
        }

        // Show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(data.error || 'Payment failed');
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
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        {/* Coming Soon Mode */}
        {isComingSoon ? (
          <>
            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
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

            {/* Coming Soon Content */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#fff', margin: '0 0 12px 0', fontSize: '32px' }}>
                {currentLabels.comingSoonTitle}
              </h2>
              <p style={{ color: '#fb923c', fontSize: '18px', margin: '0 0 24px 0', fontWeight: '600' }}>
                {currentLabels.comingSoonDesc}
              </p>

              {/* Features Preview */}
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '24px',
              }}>
                <h3 style={{ color: '#93c5fd', margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  {locale === 'ko' ? '곧 이용 가능한 기능' : locale === 'ja' ? 'すぐに利用可能な機能' : 'Features Coming Soon'}
                </h3>
                <div style={{ textAlign: 'left' }}>
                  {currentLabels.features.map((feature, idx) => (
                    <div key={idx} style={{ color: '#cbd5e1', marginBottom: '10px', fontSize: '14px' }}>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Message */}
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                {currentLabels.comingSoonMsg}
              </p>

              {/* Close Button */}
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#6366f1',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#4f46e5';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#6366f1';
                }}
              >
                {currentLabels.comingSoonBtn}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Original Payment Form (Hidden for now) */}
            <div style={{ display: 'none' }}>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
