import React, { useState } from 'react';
import { useLocale } from '../LocaleContext';
import TermsModal from './Modals/TermsModal';
import PrivacyPolicyModal from './Modals/PrivacyPolicyModal';
import CookiePolicyModal from './Modals/CookiePolicyModal';
import SecurityPolicyModal from './Modals/SecurityPolicyModal';
import ContactModal from './Modals/ContactModal';

const Footer: React.FC = () => {
  const { locale } = useLocale();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCookie, setShowCookie] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const getLabel = () => {
    const labels = {
      ko: { terms: 'Terms of Service', privacy: 'Privacy Policy', cookie: 'Cookie Policy', security: 'Security Policy', contact: 'Contact', copyright: '© 2026 AWS SAA-C03 Study Platform' },
      en: { terms: 'Terms of Service', privacy: 'Privacy Policy', cookie: 'Cookie Policy', security: 'Security Policy', contact: 'Contact', copyright: '© 2026 AWS SAA-C03 Study Platform' },
      ja: { terms: 'Terms of Service', privacy: 'Privacy Policy', cookie: 'Cookie Policy', security: 'Security Policy', contact: 'Contact', copyright: '© 2026 AWS SAA-C03 Study Platform' }
    };
    return labels[locale as keyof typeof labels] || labels.en;
  };

  const label = getLabel();

  return (
    <>
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '20px',
        marginTop: '40px',
        backgroundColor: 'rgba(15,23,42,0.5)',
        textAlign: 'center'
      }}>
        {/* AWSARCHIVE Logo */}
        <div style={{
          marginBottom: '16px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#60a5fa',
          letterSpacing: '1px'
        }}>
          📦 AWSARCHIVE
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '12px'
        }}>
          <button
            onClick={() => setShowTerms(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline',
              padding: '0',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            {label.terms}
          </button>

          <span style={{ color: '#475569' }}>|</span>

          <button
            onClick={() => setShowPrivacy(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline',
              padding: '0',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            {label.privacy}
          </button>

          <span style={{ color: '#475569' }}>|</span>

          <button
            onClick={() => setShowCookie(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline',
              padding: '0',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            {label.cookie}
          </button>

          <span style={{ color: '#475569' }}>|</span>

          <button
            onClick={() => setShowSecurity(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline',
              padding: '0',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            {label.security}
          </button>

          <span style={{ color: '#475569' }}>|</span>

          <button
            onClick={() => setShowContact(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline',
              padding: '0',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            {label.contact}
          </button>
        </div>

        <p style={{
          fontSize: '11px',
          color: '#475569',
          margin: '0',
          marginTop: '8px'
        }}>
          {label.copyright}
        </p>
      </footer>

      {/* Modals */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
      {showCookie && <CookiePolicyModal onClose={() => setShowCookie(false)} />}
      {showSecurity && <SecurityPolicyModal onClose={() => setShowSecurity(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </>
  );
};

export default Footer;
