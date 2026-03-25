import React, { useState } from 'react';
import { useLocale } from '../../LocaleContext';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const { locale } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const getLabels = () => {
    const labels = {
      ko: {
        title: '📧 문의하기',
        name: '이름',
        email: '이메일',
        subject: '제목',
        message: '메시지',
        submit: '제출',
        cancel: '닫기',
        sending: '전송 중...',
        successMsg: '메시지가 성공적으로 전송되었습니다! 빠른 시일 내에 답변해드리겠습니다.',
        errorMsg: '메시지 전송에 실패했습니다. 다시 시도해주세요.',
        requiredMsg: '모든 항목을 입력해주세요.'
      },
      en: {
        title: '📧 Contact Us',
        name: 'Name',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        submit: 'Submit',
        cancel: 'Close',
        sending: 'Sending...',
        successMsg: 'Your message has been sent successfully! We will reply soon.',
        errorMsg: 'Failed to send message. Please try again.',
        requiredMsg: 'Please fill in all fields.'
      },
      ja: {
        title: '📧 お問い合わせ',
        name: '名前',
        email: 'メール',
        subject: '件名',
        message: 'メッセージ',
        submit: '送信',
        cancel: '閉じる',
        sending: '送信中...',
        successMsg: 'メッセージが正常に送信されました。すぐにご返信いたします。',
        errorMsg: 'メッセージの送信に失敗しました。もう一度お試しください。',
        requiredMsg: 'すべての項目を入力してください。'
      }
    };
    return labels[locale as keyof typeof labels] || labels.en;
  };

  const labels = getLabels();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력값 검증
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError(labels.requiredMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // server로 문의 전송 (상대 경로 사용 - 자동으로 현재 호스트/포트 사용)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');

      // 2초 후 자동 닫기
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(labels.errorMsg);
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
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* 제목 */}
        <h2 style={{
          fontSize: '20px',
          color: '#e2e8f0',
          marginTop: 0,
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {labels.title}
        </h2>

        {success ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '20px',
            color: '#10b981',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            ✅ {labels.successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 이름 */}
            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                {labels.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(71, 85, 105, 0.3)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            {/* 이메일 */}
            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                {labels.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(71, 85, 105, 0.3)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            {/* 제목 */}
            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                {labels.subject}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(71, 85, 105, 0.3)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            {/* 메시지 */}
            <div>
              <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                {labels.message}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message here..."
                disabled={loading}
                rows={5}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(71, 85, 105, 0.3)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '6px',
                  color: '#e2e8f0',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '12px',
                color: '#ef4444',
                fontSize: '12px'
              }}>
                ❌ {error}
              </div>
            )}

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(59, 130, 246, 0.3)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  borderRadius: '6px',
                  color: '#60a5fa',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? labels.sending : labels.submit}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(100, 116, 139, 0.2)',
                  border: '1px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {labels.cancel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
