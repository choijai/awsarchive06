import React, { useMemo } from 'react';
import { useLocale } from '../LocaleContext';

const Footer: React.FC = () => {
  const { locale } = useLocale();

  // useMemo로 최적화하여 무한 렌더링 방지
  const displayLocale = useMemo(() => {
    const stored = localStorage.getItem("aws-quiz-locale");
    return (stored === "ko" || stored === "ja") ? stored : locale;
  }, [locale]);

  const getLabel = () => {
    const labels = {
      ko: {
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        pricing: 'Pricing',
        refund: 'Refund Policy',
        contact: 'Contact',
        copyright: '© 2026 AWS SAA-C03 Study Platform'
      },
      en: {
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        pricing: 'Pricing',
        refund: 'Refund Policy',
        contact: 'Contact',
        copyright: '© 2026 AWS SAA-C03 Study Platform'
      },
      ja: {
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        pricing: 'Pricing',
        refund: 'Refund Policy',
        contact: 'Contact',
        copyright: '© 2026 AWS SAA-C03 Study Platform'
      }
    };
    return labels[locale as keyof typeof labels] || labels.en;
  };

  const label = getLabel();

  const LinkButton = ({ href, children, external = true }: { href: string; children: string; external?: boolean }) => (
    <a
      href={href}
      target={external ? "_blank" : "_self"}
      rel={external ? "noopener noreferrer" : undefined}
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
      {children}
    </a>
  );

  return (
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
        <LinkButton href="/terms.html">
          {label.terms}
        </LinkButton>

        <span style={{ color: '#475569' }}>|</span>

        <LinkButton href="/privacy.html">
          {label.privacy}
        </LinkButton>

        <span style={{ color: '#475569' }}>|</span>

        <LinkButton href="/pricing.html">
          {label.pricing}
        </LinkButton>

        <span style={{ color: '#475569' }}>|</span>

        <LinkButton href="/refund.html">
          {label.refund}
        </LinkButton>

        <span style={{ color: '#475569' }}>|</span>

        <LinkButton href={`/contact.html?lang=${displayLocale}`} external={false}>
          {label.contact}
        </LinkButton>
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
  );
};

export default Footer;
