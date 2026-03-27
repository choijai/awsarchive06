import React, { useEffect, useState } from 'react';

const CookieConsent: React.FC = () => {
  const [showCookie, setShowCookie] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowCookie(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookie(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowCookie(false);
  };

  if (!showCookie) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      zIndex: 999,
      flexWrap: 'wrap'
    }}>
      <p style={{
        color: '#cbd5e1',
        fontSize: '13px',
        margin: '0',
        flex: '1',
        minWidth: '250px',
        lineHeight: '1.5'
      }}>
        We use cookies to improve your experience. By using our site, you consent to our use of cookies in accordance with our <a href="/privacy.html" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Privacy Policy</a>.
      </p>

      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handleReject}
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#94a3b8',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
          }}
        >
          Reject
        </button>

        <button
          onClick={handleAccept}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: '#60a5fa',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#60a5fa';
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
