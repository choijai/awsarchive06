import React from 'react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {

  const content = {
    ko: {
      title: '개인정보처리방침',
      sections: [
        {
          heading: '📋 개인정보 처리방침',
          text: '이 문서는 AWS SAA-C03 Study Platform이 사용자의 데이터를 관리하는 방법을 명확히 설명하기 위한 것입니다. 당사는 투명성을 최우선시하여 서비스를 제공하는 동안 사용자의 프라이버시와 보안을 보장합니다.'
        },
        {
          heading: '1. 수집하는 개인정보',
          text: '당사는 다음의 개인정보를 수집합니다:\n\n** 필수 정보:**\n• 이메일 주소 (회원가입/로그인)\n• 사용자 ID (계정 식별)\n• 비밀번호 (계정 보안)\n\n**선택 정보:**\n• 사용자명 (게시글 작성 시)\n• 시험 시작일 (D-day 계산 용도)\n\n**자동 수집 정보:**\n• 로그인 기록 및 타임스탐프\n• 문제 생성 횟수 및 시간\n• 정답 기록 및 학습 통계\n• 사용자 에이전트 및 IP 주소\n• 쿠키 및 추적 데이터'
        },
        {
          heading: '2. 개인정보 수집 목적',
          text: '당사는 수집한 개인정보를 다음의 목적으로만 사용합니다:\n\n**서비스 제공:**\n• 회원 가입 및 본인 확인\n• 로그인 계정 관리\n• 서비스 제공 및 개인화\n\n**학습 관리:**\n• 개인별 학습 통계 제공\n• 문제 생성 할당량 관리\n• 학습 진도 추적 및 분석\n\n**결제 및 구독:**\n• 프리미엄 구독 관리\n• 결제 처리 및 거래 기록\n• 구독 상태 관리\n\n**서비스 개선:**\n• 서비스 개선 및 버그 수정\n• 사용자 피드백 수집\n• 사용 패턴 분석\n\n**법적 준수:**\n• 법적 의무 이행\n• 분쟁 해결\n• 부정행위 탐지 및 방지'
        },
        {
          heading: '3. 제3자 정보 공유',
          text: '당사는 다음의 제3자에게 개인정보를 공유합니다:\n\n• Firebase (Google): 사용자 인증, 데이터 저장\n  - Google의 개인정보보호정책 적용: https://policies.google.com/privacy\n\n• Stripe: 결제 처리 (프리미엄 구독)\n  - Stripe의 개인정보보호정책 적용: https://stripe.com/privacy\n\n• Claude API (Anthropic): AI 문제 생성\n  - Anthropic의 개인정보보호정책 적용: https://www.anthropic.com/privacy\n\n이 외의 제3자와는 개인정보를 공유하지 않습니다.'
        },
        {
          heading: '4. 개인정보 보관 기간',
          text: '• 활성 계정: 서비스 이용 기간 동안\n• 계정 삭제 신청 후: 30일 유지 (법적 요구 시 대응)\n• 1년 미사용 계정: 자동 삭제\n• 결제 정보: 관계 법령에 따라 5년 보관'
        },
        {
          heading: '5. 데이터 보안 및 암호화',
          text: '당사는 다음의 보안 조치를 취합니다:\n\n**통신 보안:**\n• 모든 데이터는 TLS 1.2 이상의 HTTPS 암호화로 전송\n• 공개 네트워크에서의 모든 데이터 전송은 보호됨\n\n**저장 보안:**\n• 비밀번호는 SHA-256 해싱으로 암호화되어 저장\n• 민감한 정보는 Firebase 암호화 저장소에 보관\n• 원문 저장 금지\n\n**액세스 제어:**\n• Firebase 보안 규칙을 통한 접근 제한\n• 역할 기반 권한 관리\n• 정기적인 보안 감시 및 모니터링\n\n**제한사항:**\n• 인터넷 전송 중 100% 보안을 보장할 수 없습니다\n• 사용자의 비밀번호 관리는 본인의 책임입니다'
        },
        {
          heading: '6. 사용자의 권리',
          text: '사용자는 다음의 권리를 가집니다:\n\n**접근 권리:**\n• 자신의 개인정보 조회 요청\n• 수집된 데이터 확인\n• 처리 방식에 대한 정보 요청\n\n**수정 권리:**\n• 부정확하거나 오래된 정보 수정\n• 개인정보 수정 요청\n\n**삭제 권리:**\n• 계정 삭제 및 개인정보 완전 삭제\n• 30일 이내 완전 제거 보장\n\n**데이터 이동성:**\n• 다른 서비스로 데이터 전송 요청\n• 기계 가독 형식 제공\n\n**거부 권리:**\n• 선택 정보 수집 거부 가능\n• 이메일 마케팅 거부\n\n**권리 행사 방법:**\ncontact@saacraft.io로 이메일 요청 (7일 이내 응답)'
        },
        {
          heading: '7. 쿠키 및 로컬 저장소',
          text: '당사는 다음의 저장소를 사용합니다:\n\n**localStorage (영구 저장):**\n• userEmail: 로그인 상태 유지\n  - 보관 기간: 계정 삭제 또는 로그아웃 시까지\n• userStatus: 사용자 등급 (guest/loggedIn/paid)\n  - 보관 기간: 상태 변경 시까지\n• examStartDate: 시험 시작일\n  - 보관 기간: 사용자 삭제 시까지\n• problemCountDate: 일일 문제 생성 날짜\n  - 보관 기간: 매일 업데이트\n\n**sessionStorage (임시 저장):**\n• 현재 세션 중 임시 데이터\n• 브라우저 창 종료 시 자동 삭제\n\n**Firebase 세션:**\n• 로그인 상태 관리\n• Firebase 보안 규칙으로 보호\n\n**사용자 제어:**\n• 브라우저 설정에서 비활성화 가능\n• 그러나 서비스 이용에 제한이 생길 수 있음\n• 자세한 내용은 쿠키정책 참조'
        },
        {
          heading: '8. 데이터 보관 및 삭제',
          text: '**활성 계정:**\n• 서비스 이용 기간 동안 데이터 보관\n\n**계정 삭제 후:**\n• 30일 유지 (법적 요구 대응 용)\n• 30일 후 완전 삭제\n\n**미사용 계정:**\n• 1년 이상 활동 없는 계정\n• 자동 삭제\n\n**결제 정보:**\n• 관계 법령에 따라 5년 보관\n• 감사 및 분쟁 해결용\n• 암호화된 상태로 저장\n\n**삭제 프로세스:**\n• 사용자 요청 시 즉시 삭제 시작\n• 30일 이내 완전 제거\n• 백업 시스템에서도 제거'
        },
        {
          heading: '9. 개인정보처리방침 변경',
          text: '**변경 사항 공지:**\n• 당사는 법령 변경이나 서비스 개선을 위해 이 정책을 변경할 수 있습니다\n• 주요 변경 사항은 서비스 공지를 통해 사전 공지됩니다\n• 이메일 공지를 보낼 수 있습니다\n\n**사용자 동의:**\n• 변경 후 서비스 계속 이용 시 변경된 정책에 동의한 것으로 간주합니다\n• 변경 전 로그아웃하면 새 정책이 적용되지 않습니다\n\n**마지막 업데이트:**\n• 2026년 3월 23일'
        },
        {
          heading: '10. 문의 및 권리 행사',
          text: '**개인정보 관련 문의:**\n이메일: contact@saacraft.io\n응답 시간: 7일 이내\n\n**보안 관련 우려사항:**\n이메일: security@saacraft.io\n응답 시간: 24시간 이내\n\n**권리 행사 방법:**\n위의 이메일 주소로 다음 정보를 포함해 요청하세요:\n• 요청 유형 (조회/수정/삭제/이동)\n• 이름 및 이메일\n• 요청 사항 상세 설명\n• 신분증 확인 자료 (선택)\n\n**응답 보장:**\n• 모든 정당한 요청에 대해 응답합니다\n• 거부 시 거부 사유를 설명합니다'
        }
      ]
    },
    en: {
      title: 'Privacy Policy',
      sections: [
        {
          heading: '📋 Privacy Policy',
          text: 'This document explains how AWS SAA-C03 Study Platform manages user data. We prioritize transparency in providing services while ensuring user privacy and security.'
        },
        {
          heading: '1. Information We Collect',
          text: 'We collect the following personal information:\n\n**Required Information:**\n• Email address (for registration/login)\n• User ID (for account identification)\n• Password (for account security)\n\n**Optional Information:**\n• Username (when writing posts)\n• Exam start date (for D-day calculation)\n\n**Automatically Collected Information:**\n• Login records and timestamps\n• Problem generation frequency and time\n• Answer records and learning statistics\n• User agent and IP address\n• Cookies and tracking data'
        },
        {
          heading: '2. Purpose of Collection',
          text: 'We use the collected information only for:\n\n**Service Provision:**\n• Member registration and identity verification\n• Login account management\n• Service provision and personalization\n\n**Learning Management:**\n• Individual learning statistics\n• Problem generation quota management\n• Learning progress tracking and analysis\n\n**Payment and Subscription:**\n• Premium subscription management\n• Payment processing and transaction records\n• Subscription status management\n\n**Service Improvement:**\n• Service improvement and bug fixes\n• User feedback collection\n• Usage pattern analysis\n\n**Legal Compliance:**\n• Legal obligations\n• Dispute resolution\n• Fraud detection and prevention'
        },
        {
          heading: '3. Third-Party Information Sharing',
          text: 'We share personal information with:\n\n• Firebase (Google): User authentication and data storage\n  - Google Privacy Policy: https://policies.google.com/privacy\n\n• Stripe: Payment processing (premium subscription)\n  - Stripe Privacy Policy: https://stripe.com/privacy\n\n• Claude API (Anthropic): AI problem generation\n  - Anthropic Privacy Policy: https://www.anthropic.com/privacy\n\nWe do not share information with any other third parties.'
        },
        {
          heading: '4. Data Retention Period',
          text: '• Active accounts: During service usage\n• After account deletion request: Retained for 30 days (for legal compliance)\n• Inactive accounts (1 year): Automatically deleted\n• Payment information: Retained for 5 years per applicable laws'
        },
        {
          heading: '5. Data Security & Encryption',
          text: 'We implement the following security measures:\n\n**Communication Security:**\n• All data transmission protected with TLS 1.2 or higher HTTPS encryption\n• All data transmission over public networks is protected\n\n**Storage Security:**\n• Passwords encrypted with SHA-256 hashing, never stored in plain text\n• Sensitive information encrypted in Firebase storage\n• No plain text storage\n\n**Access Control:**\n• Access control through Firebase security rules\n• Role-based permission management\n• Regular security monitoring\n\n**Limitations:**\n• We cannot guarantee 100% security during internet transmission\n• Users are responsible for maintaining their password security'
        },
        {
          heading: '6. User Rights',
          text: 'Users have the following rights:\n\n**Right to Access:**\n• Request to view personal information\n• Confirm data is being processed\n• Receive copies of data\n\n**Right to Rectification:**\n• Correct inaccurate or outdated information\n• Request data modification\n\n**Right to Deletion:**\n• Request account deletion and complete data removal\n• Guaranteed removal within 30 days\n\n**Right to Data Portability:**\n• Transfer data to another service\n• Receive data in machine-readable format\n\n**Right to Object:**\n• Refuse optional information collection\n• Opt-out of email marketing\n\n**How to Exercise:**\nEmail: contact@saacraft.io (response within 7 days)'
        },
        {
          heading: '7. Cookies & Local Storage',
          text: 'We use the following storage methods:\n\n**localStorage (Permanent Storage):**\n• userEmail: Maintain login session\n  - Retention: Until account deletion or logout\n• userStatus: User tier (guest/loggedIn/paid)\n  - Retention: Until status change\n• examStartDate: Exam start date\n  - Retention: Until user deletion\n• problemCountDate: Daily problem generation date\n  - Retention: Updated daily\n\n**sessionStorage (Temporary Storage):**\n• Temporary session data during current session\n• Automatically deleted when browser closes\n\n**Firebase Session:**\n• Login state management\n• Protected by Firebase security rules\n\n**User Control:**\n• Can be disabled in browser settings\n• Service functionality may be limited\n• See Cookie Policy for details'
        },
        {
          heading: '8. Data Retention & Deletion',
          text: '**Active Accounts:**\n• Data retained during service usage\n\n**After Account Deletion:**\n• 30 days retention (for legal response)\n• Complete removal after 30 days\n\n**Inactive Accounts:**\n• Accounts with 1+ year of inactivity\n• Automatically deleted\n\n**Payment Information:**\n• Retained for 5 years per applicable laws\n• For audit and dispute resolution\n• Stored in encrypted format\n\n**Deletion Process:**\n• Immediate deletion upon user request\n• Complete removal within 30 days\n• Removed from backup systems'
        },
        {
          heading: '9. Changes to Privacy Policy',
          text: '**Change Notification:**\n• We may update this policy for legal or service improvements\n• Major changes notified in advance\n• Email notification may be sent\n\n**User Consent:**\n• Continued use after changes = acceptance\n• Logout before change = old policy applies\n\n**Last Updated:**\n• March 23, 2026'
        },
        {
          heading: '10. Contact & Rights Exercise',
          text: '**Privacy Inquiries:**\nEmail: contact@saacraft.io\nResponse time: Within 7 days\n\n**Security Concerns:**\nEmail: security@saacraft.io\nResponse time: Within 24 hours\n\n**How to Exercise Rights:**\nEmail the above address with:\n• Request type (access/edit/delete/transfer)\n• Name and email\n• Detailed description of request\n• ID verification (optional)\n\n**Response Guarantee:**\n• All legitimate requests will be answered\n• Denial reasons will be explained'
        }
      ]
    },
    ja: {
      title: 'プライバシーポリシー',
      sections: [
        {
          heading: '📋 プライバシーポリシー',
          text: 'このドキュメントは、AWS SAA-C03 Study Platformがユーザーデータを管理する方法を説明しています。サービス提供中もユーザーのプライバシーとセキュリティを確保することを最優先としています。'
        },
        {
          heading: '1. 収集する個人情報',
          text: '当社は以下の個人情報を収集します：\n\n**必須情報：**\n• メールアドレス（登録/ログイン用）\n• ユーザーID（アカウント識別）\n• パスワード（アカウントセキュリティ用）\n\n**オプション情報：**\n• ユーザー名（投稿作成時）\n• 試験開始日（D-day計算用）\n\n**自動収集情報：**\n• ログイン記録とタイムスタンプ\n• 問題生成の頻度と時間\n• 解答記録と学習統計\n• ユーザーエージェントとIPアドレス\n• クッキーと追跡データ'
        },
        {
          heading: '2. 情報収集の目的',
          text: '収集した情報は以下の目的でのみ使用されます：\n\n**サービス提供：**\n• メンバー登録と本人確認\n• ログインアカウント管理\n• サービス提供とパーソナライズ\n\n**学習管理：**\n• 個別学習統計\n• 問題生成クォータ管理\n• 学習進度追跡と分析\n\n**決済と購読：**\n• プレミアム購読管理\n• 決済処理と取引記録\n• 購読ステータス管理\n\n**サービス改善：**\n• サービス改善とバグ修正\n• ユーザーフィードバック収集\n• 使用パターン分析\n\n**法的準拠：**\n• 法的義務\n• 紛争解決\n• 不正検出と防止'
        },
        {
          heading: '3. 第三者への情報共有',
          text: '当社は以下の第三者と情報を共有します：\n\n• Firebase（Google）：ユーザー認証とデータ保存\n  - Googleプライバシーポリシー：https://policies.google.com/privacy\n\n• Stripe：支払い処理（プレミアム購読）\n  - Stripeプライバシーポリシー：https://stripe.com/privacy\n\n• Claude API（Anthropic）：AI問題生成\n  - Anthropicプライバシーポリシー：https://www.anthropic.com/privacy\n\nその他の第三者とは情報を共有しません。'
        },
        {
          heading: '4. データ保管期間',
          text: '• 有効なアカウント：サービス利用期間中\n• アカウント削除申請後：30日間保管（法的対応用）\n• 1年未使用アカウント：自動削除\n• 支払い情報：関連法令に従い5年間保管'
        },
        {
          heading: '5. データセキュリティと暗号化',
          text: '当社は以下のセキュリティ対策を実施しています：\n\n**通信セキュリティ：**\n• TLS 1.2以上のHTTPS暗号化で保護\n• 公開ネットワーク上のすべてのデータ送信は保護\n\n**ストレージセキュリティ：**\n• SHA-256ハッシュでパスワード暗号化、平文保存なし\n• 機密情報はFirebase暗号化ストレージに保存\n• 平文ストレージなし\n\n**アクセス制御：**\n• Firebaseセキュリティルールによるアクセス制御\n• ロールベースの権限管理\n• 定期的なセキュリティ監視\n\n**制限事項：**\n• インターネット送信中の100%セキュリティを保証不可\n• ユーザーはパスワード管理の責任を負う'
        },
        {
          heading: '6. ユーザーの権利',
          text: 'ユーザーは以下の権利を有します：\n\n**アクセス権：**\n• 個人情報の閲覧請求\n• 処理されるデータの確認\n• データのコピー受け取り\n\n**修正権：**\n• 不正確または古い情報の修正\n• 個人情報修正要求\n\n**削除権：**\n• アカウント削除と完全データ削除\n• 30日以内の削除保証\n\n**データ移行権：**\n• 他のサービスへのデータ移行\n• 機械可読形式でのデータ受け取り\n\n**拒否権：**\n• 選択情報収集の拒否\n• メールマーケティングのオプトアウト\n\n**権利行使方法：**\ncontact@saacraft.io へメール（7日以内返答）'
        },
        {
          heading: '7. クッキーとローカルストレージ',
          text: '当社は以下のストレージを使用しています：\n\n**localStorage（永続保存）：**\n• userEmail：ログインセッション維持\n  - 保管期間：アカウント削除またはログアウトまで\n• userStatus：ユーザーレベル（guest/loggedIn/paid）\n  - 保管期間：ステータス変更まで\n• examStartDate：試験開始日\n  - 保管期間：ユーザー削除まで\n• problemCountDate：日次問題生成日\n  - 保管期間：毎日更新\n\n**sessionStorage（一時保存）：**\n• 現在セッション中の一時データ\n• ブラウザ終了時に自動削除\n\n**Firebaseセッション：**\n• ログイン状態管理\n• Firebaseセキュリティルールで保護\n\n**ユーザー制御：**\n• ブラウザ設定で無効化可能\n• サービス機能が制限される可能性あり\n• クッキーポリシーを参照'
        },
        {
          heading: '8. データ保管と削除',
          text: '**有効なアカウント：**\n• サービス利用期間中はデータ保管\n\n**アカウント削除後：**\n• 30日保管（法的対応用）\n• 30日後に完全削除\n\n**未使用アカウント：**\n• 1年以上活動のないアカウント\n• 自動削除\n\n**決済情報：**\n• 関連法令に従い5年保管\n• 監査と紛争解決用\n• 暗号化形式で保存\n\n**削除プロセス：**\n• ユーザー要求時に即座に削除開始\n• 30日以内に完全削除\n• バックアップシステムからも削除'
        },
        {
          heading: '9. プライバシーポリシーの変更',
          text: '**変更通知：**\n• 法令変更またはサービス改善でポリシー更新可能\n• 重要な変更は事前に通知\n• メール通知を送信する場合あり\n\n**ユーザー同意：**\n• 変更後の使用継続 = 同意\n• 変更前にログアウト = 旧ポリシー適用\n\n**最終更新：**\n• 2026年3月23日'
        },
        {
          heading: '10. お問い合わせと権利行使',
          text: '**プライバシーに関するお問い合わせ：**\nメール：contact@saacraft.io\n対応時間：7日以内\n\n**セキュリティに関する懸念：**\nメール：security@saacraft.io\n対応時間：24時間以内\n\n**権利行使方法：**\n上記アドレスに以下を含めてメール：\n• 要求タイプ（アクセス/修正/削除/移行）\n• 名前とメール\n• 要求の詳細説明\n• 身分証確認資料（オプション）\n\n**返答保証：**\n• すべての正当な要求に返答\n• 拒否時は理由を説明'
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

export default PrivacyPolicyModal;
