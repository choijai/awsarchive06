import React from 'react';

interface TermsModalProps {
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {

  const content = {
    ko: {
      title: '이용약관',
      sections: [
        {
          heading: '1. 서비스 개요',
          text: 'AWS SAA-C03 Study Platform (이하 "서비스")은 AWS Solutions Architect Associate 시험 준비를 위한 학습 도구입니다. 본 서비스는 Claude AI를 활용하여 맞춤형 문제를 자동으로 생성합니다.'
        },
        {
          heading: '2. 이용 제한',
          text: '• 비로그인 사용자: 1일 2회 무료 문제 생성\n• 로그인 사용자: 1일 2회 무료 문제 생성\n• 프리미엄 사용자: 1일 20회 무제한 문제 생성 ($14.99/월)'
        },
        {
          heading: '3. 프리미엄 구독',
          text: '• 가격: $14.99/월\n• 결제: 매월 자동 갱신\n• 취소: 설정에서 언제든 취소 가능\n• 환불: 불가능 (취소만 가능)\n  - 구독 취소 후 다음 결제일부터 서비스 정지\n  - 이미 청구된 모든 금액은 환불되지 않습니다\n  - 환불 이유나 기간에 관계없이 환불 불가'
        },
        {
          heading: '4. 사용자의 책임',
          text: '• 사용자는 정확한 정보를 제공해야 합니다.\n• 사용자 계정의 보안을 유지해야 합니다.\n• 타인의 계정을 불정당하게 이용할 수 없습니다.\n• 서비스를 상업적 목적으로 재판매할 수 없습니다.'
        },
        {
          heading: '5. 금지 행위',
          text: '• 자동화된 도구(스크래핑, API 자동호출)로 서비스 이용\n• 대량의 요청으로 서비스 방해\n• 타인의 개인정보 도용 또는 유출\n• 불법적인 콘텐츠 생성 또는 공유'
        },
        {
          heading: '6. 서비스 중단',
          text: '당사는 다음의 경우 사전 통지 없이 서비스를 중단할 수 있습니다:\n• 시스템 유지보수\n• 긴급 보안 상황\n• 약관 위반 사용자'
        },
        {
          heading: '7. 책임 제한',
          text: '본 서비스는 "있는 그대로" 제공되며, 서비스의 오류나 문제로 인한 손실에 대해 당사는 책임을 지지 않습니다. 간접 손해배상은 불가능합니다.'
        },
        {
          heading: '8. 약관 변경',
          text: '당사는 언제든 이 약관을 변경할 수 있으며, 변경 사항은 서비스 공지를 통해 공지됩니다. 변경 후 계속 서비스를 이용하면 변경된 약관에 동의한 것으로 간주합니다.'
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      sections: [
        {
          heading: '1. Service Overview',
          text: 'AWS SAA-C03 Study Platform (hereinafter "Service") is a learning tool designed to help you prepare for the AWS Solutions Architect Associate exam. This Service automatically generates customized problems using Claude AI.'
        },
        {
          heading: '2. Usage Limits',
          text: '• Non-logged-in users: 2 free questions per day\n• Logged-in users: 2 free questions per day\n• Premium users: Unlimited 20 questions per day ($14.99/month)'
        },
        {
          heading: '3. Premium Subscription',
          text: '• Price: $14.99/month\n• Payment: Auto-renews monthly\n• Cancellation: Can be canceled anytime in settings\n• Refund: NOT AVAILABLE (cancellation only)\n  - After cancellation, service stops on the next billing date\n  - All previously charged amounts are non-refundable\n  - No refunds regardless of reason or duration'
        },
        {
          heading: '4. User Responsibilities',
          text: '• Users must provide accurate information.\n• Users must maintain the security of their account.\n• Unauthorized use of other users\' accounts is prohibited.\n• Commercial resale of the Service is prohibited.'
        },
        {
          heading: '5. Prohibited Conduct',
          text: '• Using automated tools (scraping, API calls) to access the Service\n• Sending large volumes of requests that disrupt the Service\n• Stealing or exposing personal information of others\n• Creating or sharing illegal content'
        },
        {
          heading: '6. Service Termination',
          text: 'We may terminate the Service without prior notice in the following cases:\n• System maintenance\n• Emergency security situations\n• Users who violate the Terms'
        },
        {
          heading: '7. Limitation of Liability',
          text: 'The Service is provided "as is" and we are not responsible for any losses caused by errors or issues with the Service. Indirect damages are excluded.'
        },
        {
          heading: '8. Changes to Terms',
          text: 'We may change these Terms at any time, and changes will be notified through the Service. Continued use of the Service after changes constitutes acceptance of the updated Terms.'
        }
      ]
    },
    ja: {
      title: '利用規約',
      sections: [
        {
          heading: '1. サービス概要',
          text: 'AWS SAA-C03 Study Platform（以下「本サービス」）は、AWS Solutions Architect Associate 試験の準備を支援する学習ツールです。本サービスはClaude AIを使用してカスタマイズされた問題を自動的に生成します。'
        },
        {
          heading: '2. 利用制限',
          text: '• 非ログインユーザー：1日2回の無料問題生成\n• ログインユーザー：1日2回の無料問題生成\n• プレミアムユーザー：1日20問の無制限問題生成（月$14.99）'
        },
        {
          heading: '3. プレミアム購読',
          text: '• 価格：月$14.99\n• 支払い：毎月自動更新\n• キャンセル：設定からいつでもキャンセル可能\n• 払い戻し：不可（キャンセルのみ可能）\n  - キャンセル後、次の請求日からサービスが停止\n  - すでに課金された金額は一切払い戻されません\n  - 理由や期間に関わらず払い戻し不可'
        },
        {
          heading: '4. ユーザーの責任',
          text: '• ユーザーは正確な情報を提供する必要があります。\n• ユーザーはアカウントのセキュリティを維持する必要があります。\n• 他のユーザーのアカウントを不正に使用することはできません。\n• 本サービスを商業目的で再販売することはできません。'
        },
        {
          heading: '5. 禁止事項',
          text: '• 自動化ツール（スクレイピング、API呼び出し）を使用してサービスにアクセスすること\n• 大量のリクエストを送信してサービスを妨害すること\n• 他人の個人情報を盗んだり公開したりすること\n• 違法なコンテンツを作成または共有すること'
        },
        {
          heading: '6. サービス終了',
          text: '当社は事前通知なく以下の場合にサービスを終了することができます：\n• システムメンテナンス\n• 緊急セキュリティ状況\n• 規約に違反するユーザー'
        },
        {
          heading: '7. 責任の制限',
          text: '本サービスは「現状のまま」提供され、サービスのエラーや問題による損失について当社は責任を負いません。間接的な損害賠償は除外されます。'
        },
        {
          heading: '8. 規約の変更',
          text: '当社はいつでも本規約を変更することができ、変更内容はサービスの通知を通じて公開されます。変更後もサービスを継続して使用することは、変更された規約への同意を意味します。'
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

export default TermsModal;
