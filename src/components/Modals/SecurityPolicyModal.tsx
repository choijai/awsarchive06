import React from 'react';

interface SecurityPolicyModalProps {
  onClose: () => void;
}

const SecurityPolicyModal: React.FC<SecurityPolicyModalProps> = ({ onClose }) => {

  const content = {
    ko: {
      title: '보안 및 데이터 보호',
      sections: [
        {
          heading: '보안 및 데이터 보호',
          text: '이 페이지는 AWS SAA-C03 Study Platform의 포괄적인 보안 조치와 프로토콜을 설명하기 위한 페이지입니다. 사용자 파일의 기밀성, 무결성, 안전성을 보장하기 위해 우리가 시행하는 강력한 보안 관행에 대해 알아보세요.'
        },
        {
          heading: '데이터 프라이버시 및 보안',
          text: '우리는 사용자의 개인정보 보호를 최우선시합니다. AWS SAA-C03 Study Platform은 사용자 데이터의 안전성을 위해 업계 최고 수준의 보안 표준을 준수합니다. 사용자는 언제든 자신의 개인 데이터에 접근하고, 수정하고, 삭제할 권리를 가집니다.'
        },
        {
          heading: '1. 데이터 암호화',
          text: '• HTTPS 암호화 통신: 모든 데이터 전송은 TLS 1.2 이상의 SSL/TLS 암호화로 보호됩니다\n• 저장된 비밀번호: SHA-256 해싱으로 암호화되어 저장되며, 원문으로 저장되지 않습니다\n• 민감한 정보: 사용자 이메일, 결제 정보 등은 암호화된 상태로 Firebase에 저장됩니다\n• 전송 보안: 공개 네트워크에서의 모든 데이터 전송은 암호화된 연결을 통해 보호됩니다'
        },
        {
          heading: '2. 저장소 및 데이터 보관',
          text: '• Firebase 저장소: Google Firebase의 보안 인프라를 활용하여 사용자 데이터를 안전하게 저장합니다\n• 데이터 백업: Firebase 자동 백업 기능으로 데이터 손실을 방지합니다\n• 데이터 삭제: 계정 삭제 요청 시, 사용자 데이터는 30일 이내에 완전히 삭제됩니다\n• 1년 미사용 계정: 활동이 없는 계정은 자동으로 삭제됩니다\n• 결제 정보: 관계 법령에 따라 5년간 보관 후 삭제됩니다'
        },
        {
          heading: '3. 인증 및 접근 제어',
          text: '• 강력한 비밀번호 요구: 최소 6자 이상의 비밀번호 필수\n• 회원 전용 기능: 로그인하지 않은 사용자는 제한된 기능만 이용 가능\n• 세션 관리: 30분 비활성 후 자동 로그아웃으로 보안을 강화합니다\n• 접근 제어: 관리자 기능은 인증된 관리자만 접근 가능\n• 역할 기반 권한: 사용자, 로그인 사용자, 프리미엄 사용자별로 다른 권한 부여'
        },
        {
          heading: '4. Firebase 보안',
          text: '• Firebase Authentication: Google의 안전한 인증 서비스 사용\n• Firebase Firestore: NoSQL 데이터베이스 보안 규칙으로 데이터 접근 통제\n• Firebase Security Rules: 사용자별로 접근 가능한 데이터 제한\n• 정기 보안 감시: Firebase 콘솔에서 실시간 보안 모니터링\n• Google의 보안 정책 준수: https://policies.google.com/privacy'
        },
        {
          heading: '5. 결제 보안',
          text: '• 타사 결제 처리: 결제는 안전한 타사 결제 게이트웨이를 통해 처리됩니다\n• 결제 정보 미저장: 신용카드 정보는 서버에 저장되지 않습니다\n• PCI DSS 준수: 결제 처리는 국제 결제 보안 표준을 준수합니다\n• 암호화된 거래: 모든 거래는 보안 연결을 통해 이루어집니다\n• 결제 기록: 감사 및 분쟁 해결을 위해 거래 기록을 안전하게 보관합니다'
        },
        {
          heading: '6. 사용자 계정 보안',
          text: '• 로그인 기록: 비정상적인 로그인 시도를 모니터링합니다\n• 계정 삭제: 사용자는 언제든 설정에서 계정을 즉시 삭제할 수 있습니다\n• 이메일 검증: 회원가입 시 유효한 이메일 주소 확인\n• 암호 관리: 사용자는 자신의 비밀번호 보안 유지에 책임이 있습니다\n• 공개 기기 주의: 공용 기기에서는 로그인 후 반드시 로그아웃하세요'
        },
        {
          heading: '7. API 보안',
          text: '• Claude API: Anthropic의 안전한 API를 통해 AI 문제 생성\n• API 키 보안: API 키는 서버 환경 변수로 안전하게 보관됩니다\n• Rate Limiting: 과도한 요청 방지로 서비스 악용을 차단합니다\n• 입력 검증: 모든 사용자 입력은 검증 및 새니타이제이션 처리됩니다\n• 오류 처리: 민감한 정보는 오류 메시지에 노출되지 않습니다'
        },
        {
          heading: '8. 로그 및 모니터링',
          text: '• 액세스 로그: 시스템 액세스는 기록되고 정기적으로 검토됩니다\n• 보안 이벤트: 의심스러운 활동은 모니터링되고 기록됩니다\n• 감사 추적: 주요 작업(계정 삭제, 데이터 변경)은 추적됩니다\n• 정기 검토: 보안 로그는 정기적으로 검토되어 위협을 조기에 발견합니다'
        },
        {
          heading: '9. 보안 업데이트 및 개선',
          text: '• 지속적인 평가: 우리는 정기적으로 보안 위협을 평가합니다\n• 취약점 관리: 발견된 보안 취약점은 즉시 패치됩니다\n• 의존성 업데이트: 모든 라이브러리와 의존성을 최신 상태로 유지합니다\n• 보안 개선: 새로운 보안 표준과 모범 사례를 적극적으로 도입합니다\n• 보안 공지: 중요한 보안 업데이트는 사용자에게 공지됩니다'
        },
        {
          heading: '10. 사용자 책임',
          text: '• 강력한 비밀번호: 안전하고 고유한 비밀번호 사용\n• 개인정보 보호: 개인 정보를 타인과 공유하지 마세요\n• 최신 소프트웨어: 항상 최신 브라우저와 OS를 사용하세요\n• 공개 WiFi 주의: 공개 네트워크에서는 민감한 작업을 피하세요\n• 로그아웃: 공용 기기에서는 반드시 로그아웃하세요'
        },
        {
          heading: '보안 문의',
          text: '보안 관련 우려사항이나 취약점을 발견하셨다면, 즉시 다음 이메일로 연락주세요:\n\n이메일: [security@saacraft.io 또는 보안 담당자]\n응답 시간: 24시간 이내\n\n우리는 책임감 있게 보안 문제를 처리하며, 해당 문제를 공개하기 전에 충분한 시간을 드립니다.'
        }
      ]
    },
    en: {
      title: 'Security & Data Protection',
      sections: [
        {
          heading: 'Security & Data Protection',
          text: 'This page outlines the comprehensive security measures and protocols implemented by AWS SAA-C03 Study Platform. Learn about the strong security practices we employ to ensure the confidentiality, integrity, and security of user files.'
        },
        {
          heading: 'Data Privacy & Security',
          text: 'User data privacy is our top priority. AWS SAA-C03 Study Platform adheres to industry-leading security standards to protect user data. Users have the right to access, modify, and delete their personal data at any time.'
        },
        {
          heading: '1. Data Encryption',
          text: '• HTTPS Encrypted Communication: All data transmission is protected with TLS 1.2 or higher SSL/TLS encryption\n• Stored Passwords: Encrypted with SHA-256 hashing and never stored in plain text\n• Sensitive Information: User emails and payment information are encrypted when stored in Firebase\n• Transmission Security: All data transmission over public networks is protected through encrypted connections'
        },
        {
          heading: '2. Storage & Data Retention',
          text: '• Firebase Storage: Leveraging Google Firebase secure infrastructure to safely store user data\n• Data Backups: Firebase automatic backup feature prevents data loss\n• Data Deletion: Upon account deletion request, user data is completely removed within 30 days\n• Inactive Accounts: Accounts with no activity for 1 year are automatically deleted\n• Payment Information: Retained for 5 years per applicable laws, then deleted'
        },
        {
          heading: '3. Authentication & Access Control',
          text: '• Strong Password Requirements: Minimum 6 characters password required\n• Member-Only Features: Non-logged-in users have limited access to features\n• Session Management: Automatic logout after 30 minutes of inactivity\n• Access Control: Admin features are only accessible to authenticated administrators\n• Role-Based Permissions: Different access levels for regular users, logged-in users, and premium users'
        },
        {
          heading: '4. Firebase Security',
          text: '• Firebase Authentication: Uses Google\'s secure authentication service\n• Firebase Firestore: NoSQL database security rules control data access\n• Firebase Security Rules: Access to data is restricted per user\n• Regular Security Monitoring: Real-time security monitoring through Firebase console\n• Google Security Compliance: https://policies.google.com/privacy'
        },
        {
          heading: '5. Payment Security',
          text: '• Third-Party Payment Processing: Payments are processed through secure third-party payment gateways\n• No Payment Data Storage: Credit card information is not stored on our servers\n• PCI DSS Compliance: Payment processing adheres to international payment security standards\n• Encrypted Transactions: All transactions are conducted through secure connections\n• Payment Records: Transaction records are securely maintained for auditing and dispute resolution'
        },
        {
          heading: '6. User Account Security',
          text: '• Login Records: Monitors suspicious login attempts\n• Account Deletion: Users can immediately delete their account from settings at any time\n• Email Verification: Valid email address confirmation during signup\n• Password Management: Users are responsible for maintaining their password security\n• Public Device Warning: Always logout after using public computers'
        },
        {
          heading: '7. API Security',
          text: '• Claude API: Uses Anthropic\'s secure API for AI problem generation\n• API Key Security: API keys are safely stored in server environment variables\n• Rate Limiting: Prevents excessive requests and blocks service abuse\n• Input Validation: All user inputs are validated and sanitized\n• Error Handling: Sensitive information is not exposed in error messages'
        },
        {
          heading: '8. Logging & Monitoring',
          text: '• Access Logs: System access is recorded and regularly reviewed\n• Security Events: Suspicious activities are monitored and logged\n• Audit Trail: Critical operations (account deletion, data changes) are tracked\n• Regular Review: Security logs are reviewed regularly to detect threats early'
        },
        {
          heading: '9. Security Updates & Improvements',
          text: '• Continuous Assessment: We regularly assess security threats\n• Vulnerability Management: Discovered security vulnerabilities are patched immediately\n• Dependency Updates: All libraries and dependencies are kept up to date\n• Security Improvements: New security standards and best practices are actively implemented\n• Security Notifications: Important security updates are communicated to users'
        },
        {
          heading: '10. User Responsibility',
          text: '• Strong Passwords: Use safe and unique passwords\n• Privacy Protection: Do not share personal information with others\n• Updated Software: Always use the latest browser and OS versions\n• Public WiFi Caution: Avoid sensitive activities on public networks\n• Logout: Always logout from public devices'
        },
        {
          heading: 'Security Inquiries',
          text: 'If you have security concerns or discover vulnerabilities, please contact us immediately:\n\nEmail: [security@saacraft.io or security officer]\nResponse time: Within 24 hours\n\nWe handle security issues responsibly and allow reasonable time before public disclosure.'
        }
      ]
    },
    ja: {
      title: 'セキュリティおよびデータ保護',
      sections: [
        {
          heading: 'セキュリティおよびデータ保護',
          text: 'このページは、AWS SAA-C03 Study Platformが実装する包括的なセキュリティ対策およびプロトコルについて説明しています。ユーザーファイルの機密性、完全性、安全性を保証するために実施している強力なセキュリティ慣行について説明します。'
        },
        {
          heading: 'データプライバシーおよびセキュリティ',
          text: 'ユーザーのデータプライバシーは私たちの最優先事項です。AWS SAA-C03 Study Platformは、ユーザーデータを保護するために業界最高水準のセキュリティ標準に準拠しています。ユーザーはいつでも自分の個人データにアクセスし、修正し、削除する権利があります。'
        },
        {
          heading: '1. データ暗号化',
          text: '• HTTPS暗号化通信：すべてのデータ送信はTLS 1.2以上のSSL/TLS暗号化で保護されます\n• 保存されたパスワード：SHA-256ハッシュで暗号化され、平文で保存されることはありません\n• 機密情報：ユーザーメールアドレスと決済情報はFirebaseに暗号化された状態で保存されます\n• 送信セキュリティ：公開ネットワークを介したすべてのデータ送信は暗号化された接続で保護されます'
        },
        {
          heading: '2. ストレージおよびデータ保持',
          text: '• Firebaseストレージ：Google Firebaseの安全なインフラを活用してユーザーデータを安全に保存\n• データバックアップ：Firebase自動バックアップ機能がデータ損失を防止\n• データ削除：アカウント削除要求時、ユーザーデータは30日以内に完全に削除されます\n• 1年未使用アカウント：活動がないアカウントは自動削除されます\n• 決済情報：関連法令に従い5年間保持後、削除されます'
        },
        {
          heading: '3. 認証およびアクセス制御',
          text: '• 強力なパスワード要件：最小6文字以上のパスワードが必須\n• メンバーのみ機能：ログインしていないユーザーは制限された機能のみ利用可能\n• セッション管理：非活動30分後に自動ログアウト\n• アクセス制御：管理者機能は認証された管理者のみがアクセス可能\n• ロールベースの権限：通常ユーザー、ログインユーザー、プレミアムユーザーで異なる権限'
        },
        {
          heading: '4. Firebaseセキュリティ',
          text: '• Firebase認証：Googleの安全な認証サービスを使用\n• Firestore：NoSQLデータベースセキュリティルールがデータアクセスを制御\n• Firebaseセキュリティルール：ユーザーごとにアクセス可能なデータを制限\n• 定期的なセキュリティ監視：Firebaseコンソール経由でリアルタイム監視\n• Googleセキュリティ準拠：https://policies.google.com/privacy'
        },
        {
          heading: '5. 決済セキュリティ',
          text: '• サードパーティ決済処理：安全なサードパーティ決済ゲートウェイで処理\n• 決済情報未保存：クレジットカード情報はサーバーに保存されません\n• PCI DSS準拠：決済処理は国際決済セキュリティ基準に準拠\n• 暗号化されたトランザクション：すべてのトランザクションは安全な接続を通じて実行\n• 決済記録：監査および紛争解決のため安全に記録保持'
        },
        {
          heading: '6. ユーザーアカウントセキュリティ',
          text: '• ログイン記録：不正なログイン試行を監視\n• アカウント削除：ユーザーは設定からいつでもアカウントを即座に削除可能\n• メール検証：登録時に有効なメールアドレスを確認\n• パスワード管理：ユーザーは自身のパスワードセキュリティ維持に責任がある\n• 公開端末での注意：公用機器での使用後は必ずログアウト'
        },
        {
          heading: '7. APIセキュリティ',
          text: '• Claude API：AnthropicのセキュアなAPIを使用してAI問題生成\n• APIキーセキュリティ：APIキーはサーバー環境変数で安全に保存\n• レート制限：過度なリクエストを防ぎサービス悪用をブロック\n• 入力検証：すべてのユーザー入力は検証およびサニタイズ処理\n• エラー処理：エラーメッセージに機密情報は露出しません'
        },
        {
          heading: '8. ログおよび監視',
          text: '• アクセスログ：システムアクセスは記録され定期的に検査\n• セキュリティイベント：疑わしい活動は監視され記録\n• 監査証跡：重要な操作（アカウント削除、データ変更）は追跡\n• 定期検査：セキュリティログは定期的に検査され脅威を早期検出'
        },
        {
          heading: '9. セキュリティ更新および改善',
          text: '• 継続的な評価：定期的にセキュリティ脅威を評価\n• 脆弱性管理：発見されたセキュリティ脆弱性は即座にパッチ\n• 依存関係更新：すべてのライブラリと依存関係を最新状態に維持\n• セキュリティ改善：新しいセキュリティ標準とベストプラクティスを積極的に導入\n• セキュリティ通知：重要なセキュリティ更新はユーザーに通知'
        },
        {
          heading: '10. ユーザーの責任',
          text: '• 強力なパスワード：安全でユニークなパスワードを使用\n• プライバシー保護：個人情報を他人と共有しないでください\n• 最新ソフトウェア：常に最新のブラウザとOSを使用\n• 公開WiFi注意：公開ネットワークでは機密作業を避けてください\n• ログアウト：公用機器からは必ずログアウト'
        },
        {
          heading: 'セキュリティお問い合わせ',
          text: 'セキュリティに関する懸念または脆弱性を発見した場合は、すぐに以下にご連絡ください：\n\nメール：[security@saacraft.io またはセキュリティ担当者]\n対応時間：24時間以内\n\n私たちはセキュリティ問題を責任を持って処理し、公開前に十分な時間を提供します。'
        }
      ]
    }
  };

  const data = content.en;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '700px',
        maxHeight: '85vh',
        overflowY: 'auto',
        width: '90%',
        color: '#e2e8f0'
      }}>
        <h2 style={{
          fontSize: '20px',
          marginBottom: '24px',
          marginTop: 0,
          color: '#f1f5f9'
        }}>
          {data.title}
        </h2>

        {data.sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: '8px'
            }}>
              {section.heading}
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}>
              {section.text}
            </p>
          </div>
        ))}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '24px',
            background: 'rgba(139,92,246,0.2)',
            border: '1px solid rgba(139,92,246,0.4)',
            borderRadius: '6px',
            color: '#a78bfa',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SecurityPolicyModal;
