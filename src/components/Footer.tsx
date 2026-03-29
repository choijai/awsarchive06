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
        color: 'var(--text-tertiary)',
        cursor: 'pointer',
        fontSize: '12px',
        textDecoration: 'underline',
        padding: '0',
        transition: 'color 0.2s'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--link)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
    >
      {children}
    </a>
  );

  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: '24px 20px',
      marginTop: '40px',
      backgroundColor: 'var(--bg-surface)',
      textAlign: 'center'
    }}>
      {/* AWSARCHIVE Logo */}
      <div style={{
        marginBottom: '16px',
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--accent)',
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

        <span style={{ color: 'var(--text-muted)' }}>|</span>

        <LinkButton href="/privacy.html">
          {label.privacy}
        </LinkButton>

        <span style={{ color: 'var(--text-muted)' }}>|</span>

        <LinkButton href="/pricing.html">
          {label.pricing}
        </LinkButton>

        <span style={{ color: 'var(--text-muted)' }}>|</span>

        <LinkButton href="/refund.html">
          {label.refund}
        </LinkButton>

        <span style={{ color: 'var(--text-muted)' }}>|</span>

        <LinkButton href={`/contact.html?lang=${displayLocale}`} external={false}>
          {label.contact}
        </LinkButton>
      </div>

      <p style={{
        fontSize: '11px',
        color: 'var(--text-secondary)',
        margin: '0',
        marginTop: '8px'
      }}>
        {label.copyright}
      </p>

      <p style={{
        fontSize: '10px',
        color: 'var(--text-tertiary)',
        margin: '12px 0 0 0',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-subtle)',
        lineHeight: '1.4'
      }}>
        AWS Archive is an independent educational platform not affiliated with, endorsed by, or associated with Amazon Web Services, Inc. or its affiliates. AWS and Amazon Web Services are registered trademarks of Amazon.com, Inc. or its affiliates.
      </p>
    </footer>
  );
};

export default Footer;
