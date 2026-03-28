export const CONCEPTS_JA = {
  ec2: {
    title: "Amazon EC2",
    subtitle: "Elastic Compute Cloud",
    easy: "EC2はインターネット上の自分のコンピューター! 必要な時だけ借りて料金を払う仕組み。常に使うなら事前に予約すると最大72%安く使える。",
    points: [
      { label: "インスタンス購入オプション", text: "On-Demand(柔軟), Reserved(1~3年契約 最大72%割引), Spot(最大90%割引、いつでも終了可能), Dedicated Host(物理サーバー専用)", easy: "On-Demandは当日レンタル(高い), Reservedは1年長期契約(安い), Spotは空き車の超特価でいつでも返却可能。" },
      { label: "AMI", text: "Amazon Machine Image. インスタンスのOS・ソフトウェアテンプレート。カスタムAMIで高速デプロイ可能。リージョン間でコピー可能", easy: "クッキー型のようなもの! 1つの型(AMI)を作ったら、同じ形のクッキー(サーバー)をいくつでも素早く量産できる。" },
      { label: "Placement Group", text: "Cluster(同じAZ、低レイテンシ), Spread(異なるハードウェア、障害の分離), Partition(大規模分散システム)", easy: "教室の座席配置のようなもの! Clusterはチームメンバー固まって座る(素早い通信), Spreadはわざと離れて座る(一人が欠席しても他のチーム影響なし)。" },
      { label: "ストレージ", text: "EBS(永続ブロック), Instance Store(一時的・高速), EFS(共有ファイルシステム)", easy: "EBSは個人ロッカー(オフでも保持), Instance Storeは机の上のメモ(オフで消える), EFSは共用キャビネット(みんなで使える)。" },
      { label: "試験ポイント", text: "Spot Instance中断時に2分警告。ReservedはスコープAZまたはリージョン。HibernateでRAM保持状態で停止可能", easy: "Spotはカラオケの空き部屋 — 他の客が予約したら2分以内に出ないといけない! HibernateはノートPC省電力モード — オフにして再度オンにしても作業が同じままだ。" }
    ]
  },
  lambda: {
    title: "AWS Lambda",
    subtitle: "サーバーレス関数実行",
    easy: "Lambdaは小走りで仕事をする人! ファイルをアップロードした時だけ走ってきて仕事を処理して消える。常にオンにする必要がないのでコスト削減!",
    points: [
      { label: "実行制限", text: "最大実行時間15分、メモリ128MB~10GB、/tmp ストレージ512MB~10GB、同時実行デフォルト1000個", easy: "Lambdaは短距離走選手。15分以内に終わらせるべし。時間がかかればECS使用。" },
      { label: "トリガー", text: "API Gateway, S3, DynamoDB Streams, SQS, SNS, EventBridge, ALB, Cognito等", easy: "アラームのようなもの! 『ファイルアップロードされた』『メッセージきた』といった信号が来たら自動で起動して仕事をする。" },
      { label: "Concurrency", text: "Reserved Concurrency(同時実行最大制限), Provisioned Concurrency(コールドスタート防止·事前ウォーミング)", easy: "Reservedは『小走り人材最大10名まで』という上限設定、Providedは事前に待機させておく。" },
      { label: "デプロイ", text: "Zip ファイルまたはContainer Image(最大10GB)。Lambda Layerで共通ライブラリ共有", easy: "Zipはお弁当を持参、Container Imageはレストラン丸ごと宅配。Layerは共用工具庫。" },
      { label: "試験ポイント", text: "VPC内デプロイ時ENI作成→コールドスタート増加。15分超過作業はECS/Fargate使用。SQS はバッチ処理可能", easy: "LambdaをVPC内に入れるとコールドスタートが長くなる。15分超える仕事はECSに任せて!" }
    ]
  },
  s3: {
    title: "Amazon S3",
    subtitle: "Simple Storage Service",
    easy: "S3はインターネットの巨大倉庫! 容量は無限で頻繁に取り出すならStandard、たまに取り出すならGlacierに入れると安い。",
    points: [
      { label: "ストレージクラス", text: "Standard → Standard-IA → One Zone-IA → Glacier Instant → Glacier Flexible → Deep Archive", easy: "よく使うもの居間に(Standard)、たまに使うもの倉庫に(IA)、ほぼ使わないもの冷凍倉庫に(Glacier)。" },
      { label: "セキュリティ", text: "Bucket Policy(リソースベース), IAM Policy(ユーザーベース), ACL(レガシー), Presigned URL(一時アクセス), OAC", easy: "Bucket Policyは倉庫ドア規則、IAMは従業員ID、Presigned URLは一時訪問証。" },
      { label: "機能", text: "Versioning, MFA Delete, Replication(CRR/SRR), Lifecycle(自動変換・削除)", easy: "Googleドキュメント版履歴みたいだ! 修正するたびに前バージョンが残るから、誤って削除しても復旧可能。" },
      { label: "パフォーマンス", text: "接頭辞あたり秒間3,500 PUT / 5,500 GET。マルチパートアップロード(100MB以上推奨、5GB以上必須)", easy: "大荷物をいくつかの塊に分けて同時送信(マルチパート)。複数の箱で送ると高速化!" },
      { label: "試験ポイント", text: "S3バケットはグローバルだがデータはリージョンに保存。CORS設定。静的ウェブサイトホスティング可能", easy: "S3バケット名は全世界で1つだけ。データは自分が選んだリージョンに保存される。" }
    ]
  },
  rds: {
    title: "Amazon RDS",
    subtitle: "Relational Database Service",
    easy: "RDSはExcelのように整理されたDB倉庫。AWSが管理してくれるので自動バックアップも。",
    points: [
      { label: "Multi-AZ", text: "同期複製(Standby)。障害時に自動フェイルオーバー60~120秒。読み取り不可(待機用)。DNSレコード切り替え", easy: "応急対応用待機病院のようなもの! 主要病院が閉まったら1~2分で控え病院が自動で開く。" },
      { label: "Read Replica", text: "非同期複製。読み取り分散用。別リージョン可能。独立DBへの昇格可能。最大5個", easy: "教科書の複写本のようなもの! 原本が忙しい時に複写本を複数人で分け合って読める。" },
      { label: "バックアップ", text: "自動バックアップ(1~35日)、手動スナップショット(無制限保管)", easy: "自動バックアップは毎日自動で撮った写真、スナップショットは自分で撮って永遠に保管。" },
      { label: "暗号化", text: "生成時にKMS暗号化設定。その後変更不可(スナップショット→コピー→暗号化復元が必要)", easy: "金庫を作る時だけロック選択可能。後から変えたければ中身を出して新しい金庫に入れ直し。" },
      { label: "試験ポイント", text: "Multi-AZ ≠ 読み取り分散(それはRead Replica)。RDS Proxyで Lambda接続プーリング。ストレージ自動拡張", easy: "Multi-AZは『安全』(バックアップ)、Read Replicaは『速度』(分散)。試験に必ず出るよ!" }
    ]
  },
  aurora: {
    title: "Amazon Aurora",
    subtitle: "AWS最適化リレーショナルDB",
    easy: "AuroraはRDSのスーパー版! 3つのAZに6個のコピーで保存。MySQLより5倍高速なのに価格はほぼ同じ!",
    points: [
      { label: "アーキテクチャ", text: "ストレージ自動10GB~128TB。3つのAZに6コピー。2個失敗しても書き込み可、3個失敗しても読み取り可", easy: "同じ本を3つの図書館に6冊ずつ分散。図書館2つが火事でも本は安全。" },
      { label: "パフォーマンス", text: "MySQL比5倍、PostgreSQL比3倍高速。Aurora Parallel Query", easy: "通常のRDSが自転車ならAuroraはスポーツカー。MySQLコード変わらずに5倍高速!" },
      { label: "機能", text: "Aurora Serverless v2: 自動スケーリング。Global Database: リージョン間1秒未満複製", easy: "Serverless v2は客数に応じてテーブル自動調整。Global DBは韓国→米国1秒以内に反映。" },
      { label: "Aurora vs RDS", text: "Aurora: 高性能・高可用性が必要な場合。RDS: Oracle, SQL Server等特定エンジンが必要な場合", easy: "AuroraはAWS特別高性能エンジン、RDSは特定企業DBを使いたい時。" },
      { label: "試験ポイント", text: "Aurora Replicaは同じストレージ共有(複製遅延なし)。Backtrackで時点戻し", easy: "Aurora Replicaは同じ倉庫を共有するので複製時間がほぼ0に近い。" }
    ]
  },
  vpc: {
    title: "Amazon VPC",
    subtitle: "Virtual Private Cloud",
    easy: "VPCはAWS内に柵を引いた自分の町! Publicは外部アクセス可能、Privateは内部のみ。",
    points: [
      { label: "構成要素", text: "Subnet(Public/Private), Route Table, IGW, NAT Gateway, VPC Peering", easy: "公開区域(Public)は外部人出入り可能、非公開区域(Private)は住民のみ。NATは脇道。" },
      { label: "セキュリティ", text: "Security Group: ステートフル、許可のみ。NACL: ステートレス、許可+拒否、サブネットレベル", easy: "SGは家の玄関(自動許可), NACLは町の警備員(両方確認)。SGは許可のみ、NACLは拒否も。" },
      { label: "接続", text: "VPN, Direct Connect(専用線), Transit Gateway(複数VPC ハブ接続)", easy: "VPNは一般道路、Direct Connectは専用高速道路、Transit Gatewayはハブ交差点。" },
      { label: "エンドポイント", text: "Gateway Endpoint: S3, DynamoDB(無料)。Interface Endpoint: その他(ENI、費用発生)", easy: "VPC内からS3アクセス時Gateway Endpointは無料出張所設置!" },
      { label: "試験ポイント", text: "SGはステートフル、NACLはステートレス。NAT GatewayはPublic Subnetに位置", easy: "SGはスマート(自動許可), NACLはうるさい(両方設定)。NATは公開区域に設置すべし!" }
    ]
  },
  iam: {
    title: "AWS IAM",
    subtitle: "Identity and Access Management",
    easy: "IAMは会社の出入証管理システム! 従業員ごとに出入証をあげて、チーム別に権限をまとめる。",
    points: [
      { label: "構成要素", text: "User(個人), Group(集合), Role(一時権限委譲), Policy(JSON権限文書)", easy: "Userは従業員、Groupはチーム、Roleは一時出入証、Policyは規則書。" },
      { label: "Policy種類", text: "Identity-based, Resource-based, Permission Boundary, SCP(Organizations)", easy: "Identity-basedは従業員出入証権限、Resource-basedは部屋ドア案内板、SCPは会社最高規定。" },
      { label: "STS", text: "AssumeRoleで一時資格認証。クロスアカウントアクセス、EC2 Instance Profile、Web Identity Federation", easy: "STSは一時入場券発行所! 別アカウントや外部人に時間制限付き一時出入証発行。" },
      { label: "ベストプラクティス", text: "ルートアカウント未使用、MFA、最小権限原則、Access Key交換、CloudTrail監査", easy: "ルートアカウントは社長判子 — 日常使用は厳禁。最小権限のみは最高!" },
      { label: "試験ポイント", text: "Policy評価: 明示的Deny > SCP > Permission Boundary > Identity > Resource Policy", easy: "明示的拒否(Deny)があったら無条件ブロック! 別の許可があってもDeny1つで終わり。" }
    ]
  },
  sqs: {
    title: "Amazon SQS",
    subtitle: "Simple Queue Service",
    easy: "SQSは郵便ポスト! 手紙を入れておくと配達人が後で取り出して処理する。忙しくても手紙は安全に保管。",
    points: [
      { label: "タイプ", text: "Standard: 最小1回(重複可能)、順序未保証、高処理量。FIFO: 正確に1回、順序保証、300~3000 TPS", easy: "Standardは普通郵便(高速だが時々2回配達)、FIFOは書留郵便(遅いけど正確に1回)。" },
      { label: "主要設定", text: "Visibility Timeout(デフォルト30秒)、Message Retention(1分~14日)、Max Size: 256KB", easy: "Visibility Timeoutは配達人が取り出した後、別の配達人が見えないように隠す時間。" },
      { label: "DLQ", text: "Dead Letter Queue。処理失敗メッセージを分離。maxReceiveCount超過時に移動", easy: "配達失敗した手紙集めて置く特別ポスト。後で失敗理由確認可能。" },
      { label: "Long Polling", text: "空のキュー ポーリング減らして費用削減。WaitTimeSeconds 1~20秒。Short Pollingより推奨", easy: "Short Pollingは1秒ごと確認、Long Pollingは『手紙来るまで最大20秒待て』。" },
      { label: "試験ポイント", text: "SQS → Lambda バッチ処理。Fan-out: SNS → 複数SQS。FIFOは.fifo接尾辞必須", easy: "Fan-outはSNSが放送したら複数SQSが同時に受ける構造。" }
    ]
  },
  cloudwatch: {
    title: "Amazon CloudWatch",
    subtitle: "モニタリング & 観測サービス",
    easy: "CloudWatchはAWSの監視カメラ+アラームシステム! サーバーの状態を監視していて、異常があれば報告!",
    points: [
      { label: "メトリクス", text: "基本5分(無料)、詳細1分(有料)。カスタムメトリクス可能", easy: "基本監視カメラは5分ごと撮影(無料)、高画質は1分ごと(有料)。" },
      { label: "ログ", text: "Log Group → Log Stream。Log Insightsでクエリ。Metric Filterでログ→メトリクス変換", easy: "Log Groupは日記帳、Log Streamは日付別ページ。Insightsで検索みたいに探せる。" },
      { label: "アラーム", text: "OK/ALARM/INSUFFICIENT_DATA。アクション: SNS、EC2停止/終了、ASGスケーリング", easy: "CPU90%超えたらテキスト通知! 深刻ならサーバー自動増設(ASG)。" },
      { label: "イベント/EventBridge", text: "AWSイベント検出 → 自動化。Cron/Rate スケジュール実行", easy: "『毎晩12時にバックアップ実行』みたいな自動化規則設定。" },
      { label: "試験ポイント", text: "EC2メモリ/ディスクは基本メトリクスなし → CloudWatch Agent必要。クロスアカウント収集可能", easy: "EC2メモリ監視はAgent導入が必要! 試験によく出るよ。" }
    ]
  },
  elb: {
    title: "Elastic Load Balancer",
    subtitle: "トラフィック分散サービス",
    easy: "ELBはテーマパークの案内役! 人が殺到したら均等に分散する!",
    points: [
      { label: "ALB (L7)", text: "HTTP/HTTPS。パス/ヘッダー/クエリ ルーティング。Lambda·コンテナ対象。WebSocket。WAF統合", easy: "URLを見て案内するスマートな案内役。『/api』はAPIサーバーへ、『/images』は画像サーバーへ。" },
      { label: "NLB (L4)", text: "TCP/UDP/TLS。超高性能(数百万RPS)。Static IP。極端な低遅延", easy: "内容見ずに高速配信する配達人。固定IPを与えられる。ゲームサーバー向け。" },
      { label: "GWLB (L3)", text: "IPパケット。ファイアウォール/IDS/IPS前に配置。GENEVEプロトコル", easy: "すべてのトラフィックをセキュリティ検査台通すスペシャル案内役。" },
      { label: "共通機能", text: "Cross-Zone, Sticky Session, Connection Draining, Health Check", easy: "Cross-Zoneは複数ビル従業員に均等分配。Sticky Sessionは同じ従業員配定。" },
      { label: "試験ポイント", text: "ALBは固定IP없음(DNS)。NLBは固定IP。SSL/TLS終了可能", easy: "『固定IP必要』 → NLB! ALBはDNS名でのみアクセス。" }
    ]
  },
  dynamodb: {
    title: "Amazon DynamoDB",
    subtitle: "サーバーレスNoSQL DB",
    easy: "DynamoDBは引き出し棚のようなもの! 何でも入れられて1秒間に数百万回の出し入れ可能!",
    points: [
      { label: "容量モード", text: "On-Demand: 自動対応。Provisioned: RCU/WCU直接設定、より安価、Auto Scaling", easy: "On-Demandは客数に関係なく自動処理(高め)、Provisedは『今日客100人予想』と事前準備(安いが超過はエラー)。" },
      { label: "インデックス", text: "GSI: 別パーティション+ソートキー、別容量。LSI: 同じパーティションキー、別ソートキー", easy: "GSIは全く新しい住所録、LSIは同じ住所録に別ソート基準追加。" },
      { label: "DAX", text: "インメモリキャッシュ。マイクロ秒応答。API互換。読み取り10倍向上", easy: "引き出しの前の付箋! よく取り出すものは付箋から直に取ると10倍高速。" },
      { label: "高度な機能", text: "DynamoDB Streams → Lambda。Global Tables: マルチリージョン アクティブ-アクティブ。TTL: 自動削除", easy: "Global Tablesは韓国→米国自動コピー。TTLは賞味期限設定。" },
      { label: "試験ポイント", text: "パーティションキー設計核心(均等分散)。RCU=4KB/秒、WCU=1KB/秒。Transactions ACID対応", easy: "パーティションキーが片寄ったらHot Partition発生。様々な値をパーティションキーに!" }
    ]
  },
  kms: {
    title: "AWS KMS",
    subtitle: "Key Management Service",
    easy: "KMSは暗号化キー管理所! キーを作って保管する。誰が使ったか記録も残る!",
    points: [
      { label: "キー種類", text: "AWS Managed Key(無料)、Customer Managed Key($1/月)、CloudHSM(専用ハードウェア)", easy: "AWS管理マスターキー(無料)、自分で作ったキー(月$1)、CloudHSMは金庫ハードウェア丸ごとレンタル。" },
      { label: "Envelope Encryption", text: "DEKでデータ暗号化 → DEKをCMKで暗号化。大容量データ標準方式", easy: "二重封筒! データは一時キーで鍵をして、そのキーをマスターキーで鍵をする。" },
      { label: "統合サービス", text: "S3(SSE-KMS), EBS, RDS, Secrets Manager, SSM Parameter Store", easy: "ほぼすべてのAWSサービスと統合。KMSキー選択したら自動暗号化。" },
      { label: "キーポリシー", text: "KMSはリソースベースポリシー必須。IAM Policyだけでは不可。クロスアカウント時キーポリシー明記必要", easy: "KMSキーは特別 — IAM権限だけで使えない。キーポリシーに直接書く必要がある。" },
      { label: "試験ポイント", text: "暗号化EBSスナップショット共有時CMKも共有。キー削除最小7日待機", easy: "暗号化スナップショット共有する時キーも一緒にあげるべし! キー削除は7日保留。" }
    ]
  },
  cloudfront: {
    title: "Amazon CloudFront",
    subtitle: "グローバルCDN",
    easy: "CloudFrontは全世界に物をあらかじめ置く配送システム! 近い倉庫から持ってきて高速化!",
    points: [
      { label: "オリジン", text: "S3, ALB, EC2, HTTP サーバー。OACでS3をCloudFront専用に制限", easy: "オリジン倉庫から全世界のエッジ倉庫にコピー。OACはCloudFront専用南京錠。" },
      { label: "キャッシング", text: "TTL(デフォルト24時間)。Cache Policy。Invalidationで即座に無効化", easy: "一度読み込むとキャッシュに保存。TTL中保存して時間経つと新たに取得。" },
      { label: "セキュリティ", text: "HTTPS強制。WAF統合。Geo Restriction。Field Level Encryption", easy: "WAFでハッキング防御。Geo Restrictionで特定国家アクセス禁止。" },
      { label: "エッジコンピューティング", text: "Lambda@Edge: CloudFrontイベントでLambda実行。CloudFront Functions: 軽量JS", easy: "エッジで直接コード実行! 言語自動翻訳、ログイン確認等をサーバーまで行かずに処理。" },
      { label: "試験ポイント", text: "グローバルサービス(us-east-1でのみ認証書)。動的コンテンツも加速。Signed URL/Cookieで有料コンテンツ保護", easy: "CloudFront用SSL認証書は必ずus-east-1で! Signed URLは有料コンテンツ保護。" }
    ]
  },
  route53: {
    title: "Amazon Route 53",
    subtitle: "DNS及びトラフィック ルーティング",
    easy: "Route53はインターネット電話番号簿! www.naver.comを実際のIPアドレスに変える。",
    points: [
      { label: "ルーティングポリシー", text: "Simple, Weighted, Latency, Failover, Geolocation, Geoproximity, Multi-Value", easy: "WeightedはA/Bテスト、Latencyは一番高速サーバー、Failoverはバックアップサーバー。" },
      { label: "ヘルスチェック", text: "エンドポイント監視。15個グローバル ヘルスチェッカー。Failover必須組合", easy: "30秒ごとにサーバーに『生きてる?』確認。応答なければ別サーバーに回す。" },
      { label: "レコードタイプ", text: "A(IPv4), AAAA(IPv6), CNAME(ドメイン→ドメイン), Alias(AWSリソース、Zone Apex可能、無料)", easy: "Aは名前→アドレス、CNAMEは名前→別の名前、AliasはAWS専用で無料。" },
      { label: "ドメイン", text: "ドメイン購入可能。Public vs Private Hosted Zone。DNSSEC対応", easy: "Route53でドメインも買える。Privateはみんなで使う内部電話番号簿。" },
      { label: "試験ポイント", text: "AliasはELB、CloudFront、S3に使用。CNAMEはZone Apex不可。Alias必ず選択!", easy: "ルートドメインはCNAME使えない、Aliasだけ! AWSサービス接続は無条件Alias!" }
    ]
  },
  sns: {
    title: "Amazon SNS",
    subtitle: "Simple Notification Service",
    easy: "SNSは放送システム! マイクに叫んだら購読者みんなが同時に聞こえる!",
    points: [
      { label: "概要", text: "Pub/Sub。Publisher → Topic → Subscribers (SQS, Lambda, Email, SMS, HTTP)", easy: "ラジオ放送! 放送局が喋ったらラジオたちが同時受信。" },
      { label: "Fan-out パターン", text: "SNS Topic → 複数SQS Queue。並列処理。疎結合", easy: "注文完了1つで在庫差し引き、領収書送信、ポイント加算を同時処理!" },
      { label: "FIFO Topic", text: "SQS FIFOと組合。順序保証 + 重複除去。金融・在庫システム", easy: "銀行の順番表! 順番通り処理して同じ番号2回発行しない。" },
      { label: "メッセージフィルタリング", text: "Subscription Filter Policy。JSON属性ベース。費用削減・効率化", easy: "『赤い封筒だけもらう』みたいに条件のメッセージだけ選んで受け取り。" },
      { label: "試験ポイント", text: "SNSはプッシュ(SQSはポーリング)。メッセージ永続性なし。DLQはSQSに設定", easy: "SNSは放送だから保存しない。保存必要ならSQSで受け取るべし。" }
    ]
  },
  kinesis: {
    title: "Amazon Kinesis",
    subtitle: "リアルタイムデータストリーミング",
    easy: "Kinesisは川のようなデータパイプ! 流れてくるデータを受け取って処理する。",
    points: [
      { label: "Data Streams", text: "リアルタイム。シャード単位(1MB入力/2MB出力)。保管24時間~365日。直接コンシューマー管理", easy: "パイプ! シャードが多いほどより多くデータ流せる。" },
      { label: "Firehose", text: "完全管理型。S3/Redshift/OpenSearchに自動配信。バッファリング。Near Real-time", easy: "自動的にタンクに満たすシステム。管理しなくてOK。" },
      { label: "Data Analytics", text: "SQLでリアルタイム分析。異常検知・集計", easy: "流れるデータを見ながらリアルタイムSQL分析。" },
      { label: "vs SQS", text: "Kinesis: 大容量ストリーミング、多重コンシューマー、順序保証。SQS: メッセージキュー、単一コンシューマー、処理後削除", easy: "Kinesisは複数人が同じ川を見られる。SQSは1人が取り出したら消える。" },
      { label: "試験ポイント", text: "シャード数 = 処理量。Hot Partitionを防止。Firehoseはで Lambda変換可能", easy: "特定シャードにデータ集中したら病気! パーティションキー分散が重要。" }
    ]
  },
  elasticache: {
    title: "Amazon ElastiCache",
    subtitle: "インメモリキャッシュ",
    easy: "ElastiCacheは机の上のメモ紙! よく見る内容をDBから毎回取り出すと遅いから、メモリに書いておくと高速!",
    points: [
      { label: "Redis vs Memcached", text: "Redis: 永続性、複製、Multi-AZ、データ構造、Pub/Sub。Memcached: シンプル、マルチスレッド、シャーディング", easy: "Redisは電源ある高級メモ紙(消えない)、Memcachedは普通のメモ紙(消える)。" },
      { label: "キャッシング戦略", text: "Lazy Loading(キャッシュミス時に保存)、Write Through(書き込み時キャッシュ更新)、TTL期限切れ", easy: "Lazy Loadingは『ないなら持ってきてメモ』、Write Throughは『書く時メモも更新』。" },
      { label: "ユースケース", text: "DBキャッシング、セッション保存所、リアルタイムリーダーボード、Rate Limiting", easy: "ゲーム順位表、ショッピングモールカート、API呼び出し制限に使用。" },
      { label: "Redis Cluster", text: "データシャーディング 水平拡張。最大500ノード。Multi-AZ + 自動フェイルオーバー", easy: "メモ紙が多くなったら複数机に分散。より多く、より高速に!" },
      { label: "試験ポイント", text: "RDS前にElastiCache → 読み取り負荷減少。セッション管理 → Redis。Memcachedは永続性なし", easy: "RDS遅い → ElastiCacheキャッシング! セッション保存 → Redis!" }
    ]
  },
  ebs: {
    title: "Amazon EBS",
    subtitle: "Elastic Block Store",
    easy: "EBSはEC2に挿したUSB外付けHDD! コンピューター切ってもUSBは消えない。同じAZでしか使えない!",
    points: [
      { label: "ボリュームタイプ", text: "gp3(汎用、3000 IOPS), io2(プロビジョニング IOPS、DB用)、st1(処理量HDD)、sc1(コールドHDD、最安)", easy: "gp3は一般SSD、io2は高級SSD(DB用)、st1は大容量HDD、sc1は一番安いHDD。" },
      { label: "特性", text: "単一AZ。1:1接続(io1/io2はMulti-Attach)。ネットワークドライブ。独立な耐用年数", easy: "ネットワークで繋がったUSB。EC2切っても生きてる。同じAZでのみ接続可能。" },
      { label: "スナップショット", text: "増分バックアップ。S3保存。別AZ/リージョン複写。Snapshot Archive(75%安い)", easy: "USB写真撮影! 最初は全体、その次は変わった部分だけ撮って保存。" },
      { label: "暗号化", text: "KMS使用。未暗号化 → スナップショット → 暗号化複写 → 復元で変換", easy: "USBに南京錠! 最初作る時だけ設定。後から変えたければ3段階必要。" },
      { label: "試験ポイント", text: "ルートボリュームデフォルト削除(終了時)。gp3がgp2より安価+IOPS独立。RAID 0パフォーマンス向上", easy: "EC2終了したらルートEBS基本削除! 重要データはスナップショット必須。gp3がgp2より良い。" }
    ]
  },
  efs: {
    title: "Amazon EFS",
    subtitle: "Elastic File System",
    easy: "EFSは複数コンピューターが同時に使える共有フォルダ! EBSが1人で使うUSBなら、EFSは公共ファイルサーバー!",
    points: [
      { label: "特性", text: "完全管理型NFS。複数EC2マウント。Multi-AZ。自動拡張/縮小。Linux専用", easy: "複数EC2が同時に同じフォルダ開いてファイル読み書きできる。Linuxのみ!" },
      { label: "パフォーマンスモード", text: "General Purpose(デフォルト、低遅延)。Max I/O(高処理量、ビッグデータ用)", easy: "General Purposeは一般道路(高速反応)、Max I/Oは高速道路(多量)。" },
      { label: "処理量モード", text: "Bursting、Provisioned(固定)、Elastic(自動調整)", easy: "Burstingは時々爆発、Provisonedは固定速度、Elasticは自動調整。" },
      { label: "ストレージクラス", text: "Standard、EFS-IA(非頻繁アクセス)、Archive。Lifecycle Policy自動移動", easy: "よく使うもの高速棚に、たまに使うもの倉庫に。自動で移す。" },
      { label: "試験ポイント", text: "複数EC2共有 → EFS。Windows → FSx。EFSはEBSより高い代わり共有可能", easy: "複数EC2が同じファイル → EFS! Windows → FSx! EBSは1人、EFSは一緒!" }
    ]
  },
  cognito: {
    title: "Amazon Cognito",
    subtitle: "ユーザー認証",
    easy: "Cognitoはアプリの会員登録/ログイン係! Google/Facebookログインも対応!",
    points: [
      { label: "User Pool", text: "会員ディレクトリ。JWTトークン発給。ソーシャルログイン。MFA。Lambda Trigger", easy: "会員名簿! ログイン成功したら出入証(JWT)発給。Google認証ログインも可能!" },
      { label: "Identity Pool", text: "AWSリソースアクセス一時資格認証(STS)。Unauthenticatedアクセスも可能", easy: "AWSサービス使える一時キー発給。S3直接アップロード可能。" },
      { label: "フロー", text: "User Pool認証 → JWT → Identity Pool → STS → S3/DynamoDB アクセス", easy: "ログイン → トークン → AWS一時キー交換 → S3直接アップロード。中間サーバー不要!" },
      { label: "統合", text: "API Gateway: Cognito Authorizer。ALB: 認証オフロード", easy: "API Gatewayでトークン本物かCognitoが確認してくれる。" },
      { label: "試験ポイント", text: "User Pool = 認証(AuthN)、Identity Pool = 権限付与(AuthZ)。モバイルアプリAWS直接アクセスパターン", easy: "User Poolは『あなた誰?』、Identity Poolは『何できる?』。両方合わせてモバイルアプリがS3アクセス!" }
    ]
  },
  ecs: {
    title: "Amazon ECS/EKS",
    subtitle: "コンテナオーケストレーション",
    easy: "ECSはコンテナボックスを管理する班長! Fargate使ったらサーバー管理をAWSがすべてやってくれる!",
    points: [
      { label: "ECS vs EKS", text: "ECS: AWS独自。EKS: 管理型Kubernetes(オープンソース、移植性高い)", easy: "ECSはAWSのやり方、EKSはKubernetes。別クラウドに引越し可能ならEKS。" },
      { label: "ロンチタイプ", text: "EC2: 直接管理、費用削減。Fargate: サーバーレス、便利、より高い", easy: "EC2は直接管理(安いけど仕事多い)、Fargateはaws管理(高いけど楽)。" },
      { label: "Task & Service", text: "Task Definition: コンテナ設定。Service: Task数維持・ELB連動・Auto Scaling", easy: "Task Definitionはレシピ、Taskは料理1個、Serviceは『常に3個維持』管理者。" },
      { label: "ストレージ", text: "EFSマウントでコンテナ間共有。S3はアプリコードでアクセス", easy: "コンテナ切ったら消える。重要なら EFSに保存!" },
      { label: "試験ポイント", text: "FargateはVPC/サブネット必須。Task RoleでAWS権限。ECS Anywhereでオンプレミス実行", easy: "FargateはVPC必須! AWS権限はTask Role に — EC2 Instance Profileと混同しないで!" }
    ]
  },
  asg: {
    title: "Auto Scaling Group",
    subtitle: "自動スケーリング",
    easy: "ASGは忙しい時に従業員増やして、暇な時減らす人事部! 費用も節約!",
    points: [
      { label: "スケーリングポリシー", text: "Target Tracking(目標値維持)、Step(段階別)、Scheduled(時間ベース)、Predictive(ML予測)", easy: "Target Trackingはエアコンみたいに『CPU50%維持』。Scheduledは時間表通り。" },
      { label: "主要設定", text: "Min/Max/Desired インスタンス数。Health Check(EC2/ELB)。Cooldown(デフォルト300秒)", easy: "『最小2台、最大10台、平時3台』。Cooldownは安定化時間。" },
      { label: "Launch Template", text: "AMI、インスタンスタイプ、SG、キーペアなど設定", easy: "新入社員採用基準表。OS、コンピューター仕様、セキュリティ設定事前設定。" },
      { label: "Lifecycle Hook", text: "インスタンス開始/終了時にカスタム作業実行", easy: "サーバー起動時『ソフトウェア導入完了まで待て』設定。" },
      { label: "試験ポイント", text: "ELB連動時Health CheckはELB基準推奨。Spot混合で費用削減", easy: "ELB基準Health Checkが正確。Spot混ぜると最大90%削減!" }
    ]
  },
  beanstalk: {
    title: "AWS Elastic Beanstalk",
    subtitle: "PaaS プラットフォーム",
    easy: "Beanstalkはコードだけ持ってくれば、サーバー設定は自動でやる店長!",
    points: [
      { label: "対応環境", text: "Node.js、Python、Java、.NET、PHP、Ruby、Go、Docker", easy: "どんな言語でもコード上げたら合う環境で実行!" },
      { label: "デプロイ方式", text: "All at once、Rolling、Rolling with batch、Immutable、Blue/Green", easy: "All at onceは同時交換、Rollingは順次、Blue/Greenは新規作成後切り替え。" },
      { label: "構成要素", text: "Application → Environment(Web/Worker) → Application Version", easy: "Applicationは会社、Environmentは開発チーム/運営チーム、Versionはデプロイパッケージ。" },
      { label: "設定", text: ".ebextensionsでカスタム。CloudFormation使用。RDSは外部推奨", easy: ".ebextensionsで設定カスタマイズ。RDSは別に作ると安全。" },
      { label: "試験ポイント", text: "Beanstalk自体無料(リソースのみ課金)。Blue/Green無中断デプロイ。WorkerはSQS連動", easy: "Beanstalk自体無料! Blue/Greenで無中断デプロイ可能!" }
    ]
  },
  glacier: {
    title: "S3 Glacier",
    subtitle: "長期アーカイビング",
    easy: "Glacierは冷凍倉庫! 滅多に使わない書類を安く保管。取り出すのに時間かかる!",
    points: [
      { label: "3つのティア", text: "Instant(ミリ秒)、Flexible(1~12時間)、Deep Archive(12~48時間、最安)", easy: "Instantは冷蔵庫、Flexibleは冷凍室、Deep Archiveは地下氷倉庫(一番安い)。" },
      { label: "費用", text: "S3 Standard比最大95%安い。検索費用は別途", easy: "Standard比最大95%安い! 取り出す時だけ費用発生。" },
      { label: "S3 Lifecycle", text: "Standard → IA → Glacier → Deep Archive自動転換", easy: "ファイルが古いほど自動的にもっと安い倉庫に引っ越し。" },
      { label: "Vault Lock", text: "WORM方針。法令遵守。変更不可", easy: "一度保管したら削除不可。法的保管義務に使用。" },
      { label: "試験ポイント", text: "Flexible最小90日、Deep Archive最小180日。前倒し削除時残金請求", easy: "Glacierは最小保管期間ある! 早く削除したら残り料金払う。" }
    ]
  },
  redshift: {
    title: "Amazon Redshift",
    subtitle: "データウェアハウス",
    easy: "Redshiftは分析用図書館! 『過去3年で一番売上がいい商品は?』みたいな複雑な分析に高速で答える!",
    points: [
      { label: "アーキテクチャ", text: "Leader Node(計画) + Compute Nodes(処理)。列型ストレージ。並列処理", easy: "Leaderは工場長、Computeは従業員。複数従業員が同時に働くから分析が高速。" },
      { label: "Spectrum", text: "S3データを直接クエリ。データ移動不要", easy: "S3ファイルをRedshiftで直接SQL照会! データ移動しなくてOK。" },
      { label: "ロード", text: "COPYコマンドでS3/DynamoDBから大量ロード。Kinesis Firehoseでリアルタイム適材", easy: "S3からCOPYで大量取得。Firehoseで自動リアルタイム適材。" },
      { label: "クラスター", text: "RA3: ストレージ分離(S3)。DC2: 高性能SSD。サーバーレスオプション", easy: "RA3はコンピューティング+保存分離。サーバーレスはクラスター管理なく照会のみ。" },
      { label: "試験ポイント", text: "OLAP専用。OLTP → RDS/Aurora。Multi-AZ制限的(RA3のみ)", easy: "Redshiftは分析(OLAP)用! リアルタイム処理(OLTP) → RDS/Aurora!" }
    ]
  },
  directconn: {
    title: "AWS Direct Connect",
    subtitle: "専用線接続",
    easy: "Direct Connectは専用高速道路! インターネット(VPN)は一般道路だから混雑するけど専用線はいつも速く安定!",
    points: [
      { label: "特徴", text: "物理専用線。一貫した性能。1Gbps~100Gbps。インターネット経由しない", easy: "AWSまで光ケーブル直接接続。別トラフィック影響なし。" },
      { label: "接続方式", text: "Dedicated: AWSから直接ポート割当。Hosted: APN パートナー経由提供", easy: "Dedicatedは直接ケーブル、Hostedは中間業者経由(より早い導入)。" },
      { label: "Virtual Interface", text: "Public VIF: S3等パブリックアクセス。Private VIF: VPC内部。Transit VIF: Transit GW", easy: "Public VIFは公開サービス用、Private VIFはVPC内部アクセス用レーン。" },
      { label: "高可用性", text: "2つ以上冗長化。VPN バックアップ併行推奨。Direct Connect Gatewayで複数リージョン", easy: "専用道路1つ工事中だと困る! 2つ以上引く、またはVPN バックアップ必要。" },
      { label: "試験ポイント", text: "VPNより高いけど安定。導入数週~数ヶ月。暗号化基本なし(VPN over DXで解決)", easy: "Direct Connectは暗号化ない! セキュリティ必要ならVPNも合わせて使って。" }
    ]
  },
  waf: {
    title: "WAF & Shield",
    subtitle: "ウェブ防火壁 & DDoS防御",
    easy: "WAFはアプリ前の警備員、ShieldはDDoS盾!",
    points: [
      { label: "WAF", text: "L7防火壁。SQL Injection、XSS防御。IP/地域ブロック。Rate Limiting。CloudFront、ALB、API GW接続", easy: "変な要求(ハッキング試行)来たら止めろ規則設定。国またはIP禁止も可能。" },
      { label: "Web ACL & Rules", text: "規則グループ。AWS Managed Rules。許可/ブロック/カウント アクション", easy: "AWSが作ったハッキングパターンDBをそのまま使うか、直接規則追加も可能。" },
      { label: "Shield Standard", text: "無料。L3/L4 DDoS自動防御。SYN Flood、UDP Reflection防御", easy: "無料自動防御膜! 別途設定なし常にオン。" },
      { label: "Shield Advanced", text: "$3,000/月。L7 DDoS。DRT 24/7サポート。攻撃費用クレジット", easy: "月$3,000高級防御! DDoSで費用爆増したらAWSがクレジット還付。" },
      { label: "試験ポイント", text: "WAFはCloudFront(グローバル)またはALB/API GW(リージョン)。Shield AdvancedはRoute53、CF、ELB、EC2 EIP", easy: "ウェブハッキング防御 → WAF、DDoS防御 → Shield!" }
    ]
  },
  secrets: {
    title: "AWS Secrets Manager",
    subtitle: "秘密値管理",
    easy: "Secrets Managerは秘密金庫! DB パスワードを安全に保管して自動交換!",
    points: [
      { label: "核心機能", text: "秘密値保存·検索·交換自動化。RDS認証自動ローテーション。KMS暗号化", easy: "パスワードを金庫に入れて30日ごと自動交換。コード変更なく最新値使用。" },
      { label: "自動ローテーション", text: "Lambdaで定期交換。RDS対応DBは基本Lambda提供", easy: "Lambda ロボットが定期的に新パスワード作ってDBに更新。" },
      { label: "vs Parameter Store", text: "Secrets Manager: 自動ローテーション、$0.40/月。Parameter Store: 無料、ローテーション直接実装", easy: "自動交換必要 → Secrets Manager! 無料希望 → Parameter Store。" },
      { label: "アクセス制御", text: "IAM + Resource-based Policy。VPC Endpointでインターネットなしアクセス", easy: "開発チームは開発DB パスワード只、運営チームは運営DBパスワード只見えるように制御。" },
      { label: "試験ポイント", text: "RDS パスワード → Secrets Manager。Lambda環境変数ハードコーディング禁止", easy: "DBパスワード何処に? → Secrets Manager! Lambdaに直接入れたら絶対ダメ!" }
    ]
  },
  eventbridge: {
    title: "Amazon EventBridge",
    subtitle: "イベントバス",
    easy: "EventBridgeはイベント中継所! 何か起きたら自動的に別サービスに接続!",
    points: [
      { label: "イベントバス", text: "Default(AWS)、Custom(アプリ)、Partner(SaaS: Zendesk、Shopify)。アカウント間転送可能", easy: "AWSサービス、自分のアプリ、外部サービスイベントを各々別チャネルで受け取り。" },
      { label: "Rules", text: "パターンマッチングでターゲット実行。Cron/Rate スケジュール。最大5個ターゲット。入力変換", easy: "『このイベント来たら実行』規則。Cronでスケジューラーも可能。" },
      { label: "ターゲット", text: "Lambda、SQS、SNS、ECS、Step Functions、API Gateway、Kinesis等20+", easy: "Lambda実行、SQS メッセージ、SNS通知等20種類以上サービスと接続。" },
      { label: "Archive & Replay", text: "イベントアーカイビング後再処理。デバッグ·再試行·テスト活用", easy: "過去イベントを再生! バグ修正後その時点から再実行可能。" },
      { label: "試験ポイント", text: "CloudWatch Eventsのアップグレード。SaaS パートナー連動はEventBridgeのみ。Pipeパイプライン", easy: "外部サービスイベントをAWSに受け取るにはEventBridgeのみ可能!" }
    ]
  },
  cloudtrail: {
    title: "AWS CloudTrail",
    subtitle: "API監査ログ",
    easy: "CloudTrailはAWS ドライブレコーダー! 誰がいつどんなサーバー作ったか全部記録!",
    points: [
      { label: "イベントタイプ", text: "Management Events(API呼び出し、デフォルト有効)、Data Events(S3/Lambda、別途設定)、Insight Events(異常検知)", easy: "Managementは『誰がEC2作った』、DataはS3ファイル開いた』みたいな詳細記録。" },
      { label: "保存", text: "デフォルト90日(コンソール)。S3保存時無制限。CloudWatch Logs リアルタイム。Athena分析", easy: "コンソール90日のみ表示。S3に保存したら永遠に。Athenaで SQL分析も可能。" },
      { label: "Trail", text: "単一リージョンまたはすべてのリージョン。組織Trail: Organizations全体中央収集。無結性検証", easy: "全世界すべての地域記録を1箇所に集められる。" },
      { label: "セキュリティ", text: "SSE-KMS暗号化。S3アクセス制御。MFA Delete削除防止", easy: "ログファイルはKMSで暗号化。MFAないと削除不可 — 証拠隠滅防止!" },
      { label: "試験ポイント", text: "CloudTrail ≠ CloudWatch。『誰が削除?』 → CloudTrail。『サーバー何で遅い?』 → CloudWatch", easy: "CloudTrailは監査日誌(誰が何した)、CloudWatchはパフォーマンス監視。別目的!" }
    ]
  },
  apigw: {
    title: "Amazon API Gateway",
    subtitle: "API管理",
    easy: "API Gatewayはアプリの玄関! 要求を受けてLambda、EC2に渡し、Throttling、Cachingも!",
    points: [
      { label: "API タイプ", text: "REST(フル機能·キャッシング)、HTTP(70%安い·高速)、WebSocket(リアルタイム双方向)", easy: "RESTはフルオプション自動ドア、HTTPは基本ドア(安い)、WebSocketはチャット·ゲーム用。" },
      { label: "統合", text: "Lambda Proxy、AWSサービス直接(S3、DynamoDB)、HTTP バックエンド、Mock", easy: "Lambda Proxyは電話接続、直接統合はDynamoDB直接照会、Mockはテスト用ダミー。" },
      { label: "セキュリティ", text: "IAM、Cognito Authorizer、Lambda Authorizer、Resource Policy(IP/VPC制限)", easy: "IAMは社員証、Cognitoは会員トークン、Lambda Authorizerはカスタム確認。" },
      { label: "パフォーマンス", text: "Throttling: デフォルト10,000 RPS。キャッシング: TTL 300秒。Stage別デプロイ(dev/prod)", easy: "要求殺到時番号札待機。よく聞く話はキャッシュ。dev/prod分離管理。" },
      { label: "試験ポイント", text: "Edge-Optimized(グローバル)、Regional(1リージョン)、Private(VPC)。WebSocket → リアルタイムチャット", easy: "全世界 → Edge、1リージョン → Regional、内部ネット → Private。リアルタイムチャット → WebSocket!" }
    ]
  }
};
