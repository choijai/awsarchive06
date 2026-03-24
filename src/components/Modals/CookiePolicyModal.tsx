import React from 'react';

interface CookiePolicyModalProps {
  onClose: () => void;
}

const CookiePolicyModal: React.FC<CookiePolicyModalProps> = ({ onClose }) => {

  const content = {
    ko: {
      title: '쿠키정책',
      sections: [
        {
          heading: '1. 쿠키란?',
          text: '쿠키는 사용자의 브라우저에 저장되는 작은 텍스트 파일입니다. 이는 사용자의 선호도와 행동을 기억하여 더 나은 사용자 경험을 제공합니다.'
        },
        {
          heading: '2. 당사가 사용하는 저장 기술',
          text: '당사는 다음의 저장 기술을 사용합니다:\n\n**localStorage (영구 저장):**\n• userEmail: 로그인한 사용자의 이메일 주소\n  목적: 로그인 상태 유지\n  보관 기간: 계정 삭제 또는 브라우저 캐시 삭제 시까지\n\n• userStatus: 사용자 상태 (게스트/로그인/프리미엄)\n  목적: 사용자 등급 구분\n  보관 기간: 상태 변경 또는 브라우저 캐시 삭제 시까지\n\n• examStartDate: 시험 시작 예정일\n  목적: D-day 카운트다운 계산\n  보관 기간: 날짜 수정 또는 브라우저 캐시 삭제 시까지\n\n• problemCountDate: 마지막 문제 생성 날짜\n  목적: 일일 할당량 제한 관리\n  보관 기간: 날짜 업데이트 또는 브라우저 캐시 삭제 시까지\n\n**sessionStorage (임시 저장):**\n• 임시 세션 데이터\n  목적: 현재 세션 동안의 임시 정보 저장\n  보관 기간: 브라우저 창 종료 시 자동 삭제\n\n**Firebase (서버 저장소):**\n• 세션 및 인증 정보\n  목적: 사용자 로그인 상태 유지\n  보관 기간: 계정 활성 중'
        },
        {
          heading: '3. 쿠키 사용 목적',
          text: '당사는 쿠키를 다음의 목적으로만 사용합니다:\n\n필수 쿠키:\n• 로그인 유지: 매번 로그인할 필요가 없도록\n• 사용자 경험 개선: 사용자별 맞춤 설정 저장\n• 일일 할당량 관리: 1일 2회/20회 제한 운영\n\n분석 쿠키:\n• 서비스 사용 패턴 분석 (Firebase Analytics)\n• 성능 모니터링\n\n광고 쿠키:\n• 당사는 광고 쿠키를 사용하지 않습니다.'
        },
        {
          heading: '4. 쿠키 관리',
          text: 'www사용자는 언제든 쿠키를 관리할 수 있습니다:\n\n**브라우저에서 쿠키 비활성화:**\n\nChrome:\n1. 설정 > 개인정보 보호 및 보안\n2. 쿠키 및 기타 사이트 데이터\n3. 모든 쿠키 차단 (권장하지 않음)\n\nFirefox:\n1. 설정 > 개인정보\n2. 쿠키 및 사이트 데이터\n3. 모든 쿠키 삭제\n\nSafari:\n1. 설정 > 개인정보\n2. 쿠키 및 웹사이트 데이터\n3. "항상 차단" 선택\n\n**localStorage 삭제:**\n브라우저의 개발자 도구(F12)를 열어 Application 탭에서 직접 삭제 가능합니다.\n\n주의: 쿠키를 비활성화하면 로그인 상태가 유지되지 않을 수 있습니다.'
        },
        {
          heading: '5. 제3자 쿠키',
          text: '당사가 사용하는 제3자 서비스의 쿠키:\n\n**Firebase (Google):**\n• 목적: 사용자 인증 및 세션 관리\n• 정책: https://policies.google.com/privacy\n\n**Google Analytics:**\n• 목적: 서비스 이용 통계 분석\n• 정책: https://policies.google.com/privacy\n\n이 제3자들의 쿠키 정책을 확인하려면 위의 링크를 방문하시기 바랍니다.'
        },
        {
          heading: '6. 쿠키 정책 변경',
          text: '당사는 서비스 개선이나 법령 변경에 따라 쿠키 정책을 변경할 수 있습니다. 주요 변경 사항은 서비스 공지를 통해 공지됩니다.'
        },
        {
          heading: '7. 문의',
          text: '쿠키에 관한 질문이 있으시면 이메일로 문의해주시기 바랍니다.\n\n이메일: [contact@saacraft.io 또는 운영자 이메일]\n응답 시간: 7일 이내'
        }
      ]
    },
    en: {
      title: 'Cookie Policy',
      sections: [
        {
          heading: '1. What is a Cookie?',
          text: 'A cookie is a small text file stored on the user\'s browser. It remembers user preferences and behavior to provide a better user experience.'
        },
        {
          heading: '2. Storage Technologies We Use',
          text: 'We use the following storage technologies:\n\n**localStorage (Permanent Storage):**\n• userEmail: Email address of logged-in users\n  Purpose: Maintain login state\n  Retention: Until account deletion or browser cache clear\n\n• userStatus: User status (guest/loggedIn/paid)\n  Purpose: Distinguish user tiers\n  Retention: Until status change or browser cache clear\n\n• examStartDate: Exam start date\n  Purpose: Calculate D-day countdown\n  Retention: Until date modification or browser cache clear\n\n• problemCountDate: Last problem generation date\n  Purpose: Manage daily quota limits\n  Retention: Until date update or browser cache clear\n\n**sessionStorage (Temporary Storage):**\n• Temporary session data\n  Purpose: Store temporary information during current session\n  Retention: Auto-deleted when browser window closes\n\n**Firebase (Server Storage):**\n• Session and authentication information\n  Purpose: Maintain user login state\n  Retention: While account is active'
        },
        {
          heading: '3. Purpose of Cookie Use',
          text: 'We use cookies only for:\n\nEssential Cookies:\n• Login persistence: Avoid re-logging in every time\n• User experience improvement: Save user-specific settings\n• Daily quota management: Enforce 2/20 question limits\n\nAnalytical Cookies:\n• Analyze service usage patterns (Firebase Analytics)\n• Monitor performance\n\nAdvertising Cookies:\n• We do not use advertising cookies.'
        },
        {
          heading: '4. Cookie Management',
          text: 'Users can manage cookies anytime:\n\n**Disable Cookies in Browser:**\n\nChrome:\n1. Settings > Privacy and Security\n2. Cookies and other site data\n3. Block all cookies (not recommended)\n\nFirefox:\n1. Settings > Privacy\n2. Cookies and Site Data\n3. Delete all cookies\n\nSafari:\n1. Settings > Privacy\n2. Cookies and website data\n3. Select "Block all"\n\n**Delete localStorage:**\nOpen browser Developer Tools (F12) and delete directly in the Application tab.\n\nNote: Disabling cookies may prevent login persistence.'
        },
        {
          heading: '5. Third-Party Cookies',
          text: 'Third-party service cookies used by us:\n\n**Firebase (Google):**\n• Purpose: User authentication and session management\n• Policy: https://policies.google.com/privacy\n\n**Google Analytics:**\n• Purpose: Analyze service usage statistics\n• Policy: https://policies.google.com/privacy\n\nFor more information about third-party cookie policies, visit the links above.'
        },
        {
          heading: '6. Changes to Cookie Policy',
          text: 'We may change this cookie policy due to service improvements or legal changes. Major changes will be notified through the Service.'
        },
        {
          heading: '7. Contact Us',
          text: 'For questions about cookies, please email us.\n\nEmail: [contact@saacraft.io or administrator email]\nResponse time: Within 7 days'
        }
      ]
    },
    ja: {
      title: 'クッキーポリシー',
      sections: [
        {
          heading: '1. クッキーとは',
          text: 'クッキーはユーザーのブラウザに保存される小さなテキストファイルです。これはユーザーの好みと行動を記憶し、より良いユーザー体験を提供します。'
        },
        {
          heading: '2. 当社が使用するストレージ技術',
          text: '当社は以下のストレージ技術を使用しています：\n\n**localStorage（永続保存）:**\n• userEmail：ログインユーザーのメールアドレス\n  目的：ログイン状態の維持\n  保持期間：アカウント削除またはブラウザキャッシュクリアまで\n\n• userStatus：ユーザーステータス（ゲスト/ログイン/プレミアム）\n  目的：ユーザーティアの区別\n  保持期間：ステータス変更またはブラウザキャッシュクリアまで\n\n• examStartDate：試験開始予定日\n  目的：D-day カウントダウン計算\n  保持期間：日付変更またはブラウザキャッシュクリアまで\n\n• problemCountDate：最後の問題生成日\n  目的：日次クォータ制限の管理\n  保持期間：日付更新またはブラウザキャッシュクリアまで\n\n**sessionStorage（一時保存）:**\n• 一時セッションデータ\n  目的：現在のセッション中の一時情報を保存\n  保持期間：ブラウザウィンドウ終了時に自動削除\n\n**Firebase（サーバーストレージ）:**\n• セッションと認証情報\n  目的：ユーザーログイン状態の維持\n  保持期間：アカウントがアクティブな間'
        },
        {
          heading: '3. クッキー使用の目的',
          text: '当社はクッキーを以下の目的でのみ使用します：\n\n必須クッキー：\n• ログイン維持：毎回ログインする必要がない\n• ユーザー体験向上：ユーザー固有の設定を保存\n• 日次クォータ管理：2/20問の制限を実施\n\n分析クッキー：\n• サービス使用パターン分析（Firebase Analytics）\n• パフォーマンス監視\n\n広告クッキー：\n• 当社は広告クッキーを使用していません。'
        },
        {
          heading: '4. クッキー管理',
          text: 'ユーザーはいつでもクッキーを管理できます：\n\n**ブラウザでクッキーを無効化:**\n\nChrome：\n1. 設定 > プライバシーとセキュリティ\n2. クッキーと他のサイトデータ\n3. すべてのクッキーをブロック（非推奨）\n\nFirefox：\n1. 設定 > プライバシー\n2. クッキーとサイトデータ\n3. すべてのクッキーを削除\n\nSafari：\n1. 設定 > プライバシー\n2. クッキーとウェブサイトデータ\n3. 「すべてをブロック」を選択\n\n**localStorageの削除:**\nブラウザの開発者ツール（F12）を開いてApplicationタブで直接削除できます。\n\n注意：クッキーを無効化するとログイン状態が維持されない場合があります。'
        },
        {
          heading: '5. 第三者クッキー',
          text: '当社が使用する第三者サービスのクッキー：\n\n**Firebase（Google）:**\n• 目的：ユーザー認証とセッション管理\n• ポリシー：https://policies.google.com/privacy\n\n**Google Analytics:**\n• 目的：サービス利用統計分析\n• ポリシー：https://policies.google.com/privacy\n\n第三者のクッキーポリシーの詳細については、上記のリンクをご確認ください。'
        },
        {
          heading: '6. クッキーポリシーの変更',
          text: '当社はサービス改善または法令変更に応じてクッキーポリシーを変更することがあります。重要な変更はサービスの通知を通じて告知されます。'
        },
        {
          heading: '7. お問い合わせ',
          text: 'クッキーに関するご質問はメールでお問い合わせください。\n\nメール：[contact@saacraft.io または管理者メール]\n対応時間：7日以内'
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

export default CookiePolicyModal;
