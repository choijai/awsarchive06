export interface AWSNode {
  id: string;
  name: string;
  cat: 'compute' | 'storage' | 'database' | 'network' | 'security' | 'messaging' | 'monitor';
  emoji: string;
  desc: string;
}

export interface Link {
  s: string;
  t: string;
}

export interface ConceptPoint {
  label: string;
  text: string;
  easy: string;
}

export interface Concept {
  title: string;
  subtitle: string;
  easy: string;
  points: ConceptPoint[];
}

export const NODES: AWSNode[] = [
  { id:"ec2",        name:"EC2",             cat:"compute",   emoji:"\u{1F5A5}\uFE0F", desc:"가상 서버 · AMI · Spot/Reserved · Placement Group" },
  { id:"lambda",     name:"Lambda",          cat:"compute",   emoji:"λ",  desc:"서버리스 함수 · 최대 15분 · 이벤트 트리거 · Concurrency" },
  { id:"ecs",        name:"ECS/EKS",         cat:"compute",   emoji:"\u{1F433}", desc:"컨테이너 · Fargate(서버리스) vs EC2 런치타입" },
  { id:"asg",        name:"Auto Scaling",    cat:"compute",   emoji:"\u{1F4C8}", desc:"자동 스케일링 · Target Tracking / Step / Scheduled" },
  { id:"beanstalk",  name:"Beanstalk",       cat:"compute",   emoji:"\u{1FAD8}", desc:"PaaS · 코드만 올리면 인프라 자동 관리" },
  { id:"s3",         name:"S3",              cat:"storage",   emoji:"\u{1FAA3}", desc:"객체 스토리지 · Storage Class · Lifecycle · Versioning" },
  { id:"ebs",        name:"EBS",             cat:"storage",   emoji:"\u{1F4BE}", desc:"블록 스토리지 · EC2 attach · gp3/io2/st1/sc1 · 단일 AZ" },
  { id:"efs",        name:"EFS",             cat:"storage",   emoji:"\u{1F4C1}", desc:"네트워크 파일시스템 · 여러 EC2 동시 마운트 · Multi-AZ" },
  { id:"glacier",    name:"S3 Glacier",      cat:"storage",   emoji:"\u{1F9CA}", desc:"장기 아카이빙 · Instant/Flexible/Deep Archive" },
  { id:"rds",        name:"RDS",             cat:"database",  emoji:"\u{1F5C4}\uFE0F", desc:"관리형 RDBMS · Multi-AZ · Read Replica · 자동 백업" },
  { id:"aurora",     name:"Aurora",          cat:"database",  emoji:"\u2728", desc:"AWS 최적화 DB · MySQL/PostgreSQL 호환 · 6개 복제본" },
  { id:"dynamodb",   name:"DynamoDB",        cat:"database",  emoji:"\u26A1", desc:"서버리스 NoSQL · DAX 캐시 · Global Tables" },
  { id:"elasticache",name:"ElastiCache",     cat:"database",  emoji:"\u{1F680}", desc:"인메모리 캐시 · Redis(영속성) vs Memcached(단순)" },
  { id:"redshift",   name:"Redshift",        cat:"database",  emoji:"\u{1F4CA}", desc:"데이터 웨어하우스 · OLAP · Spectrum으로 S3 쿼리" },
  { id:"vpc",        name:"VPC",             cat:"network",   emoji:"\u{1F310}", desc:"가상 네트워크 · Subnet · IGW · NAT Gateway · SG" },
  { id:"elb",        name:"ELB",             cat:"network",   emoji:"\u2696\uFE0F", desc:"로드밸런서 · ALB(L7) · NLB(L4) · GWLB" },
  { id:"cloudfront", name:"CloudFront",      cat:"network",   emoji:"\u2601\uFE0F", desc:"CDN · 엣지 캐싱 · OAC로 S3 보호 · Lambda@Edge" },
  { id:"route53",    name:"Route 53",        cat:"network",   emoji:"\u{1F500}", desc:"DNS · Weighted/Latency/Failover/Geolocation" },
  { id:"apigw",      name:"API Gateway",     cat:"network",   emoji:"\u{1F6AA}", desc:"API 관리 · REST/WebSocket · Lambda 통합 · Throttling" },
  { id:"directconn", name:"Direct Connect",  cat:"network",   emoji:"\u{1F50C}", desc:"전용선 연결 · 안정적 대역폭 · VPN보다 일관된 성능" },
  { id:"iam",        name:"IAM",             cat:"security",  emoji:"\u{1F510}", desc:"권한 관리 · Role/Policy · STS AssumeRole" },
  { id:"kms",        name:"KMS",             cat:"security",  emoji:"\u{1F511}", desc:"키 관리 · CMK · S3/EBS/RDS 암호화 · Envelope Encryption" },
  { id:"waf",        name:"WAF & Shield",    cat:"security",  emoji:"\u{1F6E1}\uFE0F", desc:"WAF: L7 방화벽 · Shield Standard/Advanced: DDoS 방어" },
  { id:"cognito",    name:"Cognito",         cat:"security",  emoji:"\u{1F464}", desc:"사용자 인증 · User Pool(인증) + Identity Pool" },
  { id:"secrets",    name:"Secrets Manager", cat:"security",  emoji:"\u{1F5DD}\uFE0F", desc:"비밀값 관리 · DB 비번 자동 로테이션" },
  { id:"sqs",        name:"SQS",             cat:"messaging", emoji:"\u{1F4EC}", desc:"메시지 큐 · Standard vs FIFO · DLQ · Visibility Timeout" },
  { id:"sns",        name:"SNS",             cat:"messaging", emoji:"\u{1F4E3}", desc:"Pub/Sub · Topic → 여러 구독자 · Fan-out 패턴" },
  { id:"eventbridge",name:"EventBridge",     cat:"messaging", emoji:"\u{1F309}", desc:"이벤트 버스 · 이벤트 기반 아키텍처 · 스케줄러" },
  { id:"kinesis",    name:"Kinesis",         cat:"messaging", emoji:"\u{1F30A}", desc:"실시간 스트리밍 · Data Streams/Firehose/Analytics" },
  { id:"cloudwatch", name:"CloudWatch",      cat:"monitor",   emoji:"\u{1F441}\uFE0F", desc:"모니터링 · Metrics/Logs/Alarms/Dashboards" },
  { id:"cloudtrail", name:"CloudTrail",      cat:"monitor",   emoji:"\u{1F4DD}", desc:"API 감사 로그 · 누가 뭘 언제 · S3 저장" },
];

export const LINKS: Link[] = [
  {s:"ec2",t:"ebs"},{s:"ec2",t:"asg"},{s:"ec2",t:"elb"},{s:"ec2",t:"vpc"},{s:"ec2",t:"iam"},{s:"ec2",t:"cloudwatch"},
  {s:"lambda",t:"apigw"},{s:"lambda",t:"sqs"},{s:"lambda",t:"sns"},{s:"lambda",t:"dynamodb"},{s:"lambda",t:"s3"},{s:"lambda",t:"iam"},{s:"lambda",t:"eventbridge"},
  {s:"s3",t:"cloudfront"},{s:"s3",t:"glacier"},{s:"s3",t:"kms"},{s:"s3",t:"cloudtrail"},{s:"s3",t:"redshift"},
  {s:"rds",t:"aurora"},{s:"rds",t:"elasticache"},{s:"rds",t:"kms"},{s:"rds",t:"secrets"},{s:"rds",t:"vpc"},
  {s:"aurora",t:"elasticache"},{s:"dynamodb",t:"lambda"},
  {s:"vpc",t:"directconn"},{s:"vpc",t:"route53"},
  {s:"elb",t:"asg"},{s:"elb",t:"waf"},{s:"cloudfront",t:"waf"},{s:"cloudfront",t:"route53"},
  {s:"apigw",t:"lambda"},{s:"apigw",t:"cognito"},
  {s:"sns",t:"sqs"},{s:"sns",t:"lambda"},{s:"kinesis",t:"lambda"},{s:"kinesis",t:"redshift"},{s:"kinesis",t:"s3"},
  {s:"eventbridge",t:"lambda"},{s:"eventbridge",t:"sqs"},
  {s:"iam",t:"kms"},{s:"cognito",t:"iam"},{s:"waf",t:"cloudfront"},
  {s:"cloudwatch",t:"asg"},{s:"cloudwatch",t:"lambda"},{s:"cloudtrail",t:"s3"},
];

export const CAT: Record<string, {color: string; glow: string; label: string}> = {
  compute:  {color:"#e67e22",glow:"#f39c12",label:"Compute"},
  storage:  {color:"#2980b9",glow:"#74b9ff",label:"Storage"},
  database: {color:"#8e44ad",glow:"#a29bfe",label:"Database"},
  network:  {color:"#27ae60",glow:"#55efc4",label:"Network"},
  security: {color:"#c0392b",glow:"#ff6b6b",label:"Security"},
  messaging:{color:"#16a085",glow:"#1abc9c",label:"Messaging"},
  monitor:  {color:"#7f8c8d",glow:"#bdc3c7",label:"Monitor"},
};

export const CONCEPTS_KO: Record<string, Concept> = {
  ec2: {
    title:"Amazon EC2", subtitle:"Elastic Compute Cloud",
    easy:"EC2는 인터넷에 있는 내 컴퓨터야! 필요할 때만 빌려 쓰고 돈을 내는 구조야. 항상 쓸 거면 미리 예약하면 최대 72% 싸게 쓸 수 있어.",
    points:[
      {label:"인스턴스 구매 옵션", text:"On-Demand(유연), Reserved(1~3년 약정 최대 72% 절감), Spot(최대 90% 절감, 언제든 종료 가능), Dedicated Host(물리 서버 전용)", easy:"On-Demand는 당일 빌리기(비쌈), Reserved는 1년 장기 계약(싸짐), Spot은 빈 차 초특가인데 언제든 뺏길 수 있어."},
      {label:"AMI", text:"Amazon Machine Image. 인스턴스 OS·소프트웨어 템플릿. 커스텀 AMI로 빠른 배포 가능. 리전간 복사 가능", easy:"쿠키 틀이야! 틀(AMI) 하나 만들어두면 같은 모양 쿠키(서버)를 몇 개든 빠르게 찍어낼 수 있어."},
      {label:"Placement Group", text:"Cluster(같은 AZ, 낮은 레이턴시), Spread(다른 하드웨어, 장애 격리), Partition(대규모 분산 시스템)", easy:"교실 자리 배치야! Cluster는 팀원 붙어 앉기(빠른 소통), Spread는 일부러 멀리 앉기(한 명 결석해도 다른 팀 영향 없음)."},
      {label:"스토리지", text:"EBS(영구 블록), Instance Store(임시·빠름), EFS(공유 파일시스템)", easy:"EBS는 개인 사물함(꺼도 유지), Instance Store는 책상 위 메모지(꺼지면 사라짐), EFS는 공용 캐비닛(여러 명이 함께 씀)."},
      {label:"시험 포인트", text:"Spot Instance 중단 시 2분 알림. Reserved는 AZ or Region 스코프. Hibernate로 RAM 유지 중지 가능", easy:"Spot은 노래방 빈 방 — 다른 손님이 예약하면 2분 안에 나가야 해! Hibernate는 노트북 절전모드 — 껐다 켜도 작업이 그대로야."},
    ]
  },
  lambda: {
    title:"AWS Lambda", subtitle:"서버리스 함수 실행",
    easy:"Lambda는 심부름꾼이야! 파일 올렸을 때만 달려와서 일을 처리하고 사라져. 항상 켜놓을 필요가 없어서 비용이 거의 안 들어!",
    points:[
      {label:"실행 제한", text:"최대 실행시간 15분, 메모리 128MB~10GB, /tmp 저장소 512MB~10GB, 동시 실행 기본 1000개", easy:"Lambda는 단거리 달리기 선수야. 15분 안에 끝내야 해. 오래 걸리면 ECS 사용."},
      {label:"트리거", text:"API Gateway, S3, DynamoDB Streams, SQS, SNS, EventBridge, ALB, Cognito 등", easy:"알람이야! '파일 올라왔다', '메시지 왔다' 같은 신호가 오면 자동으로 깨어나서 일해."},
      {label:"Concurrency", text:"Reserved Concurrency(최대 동시 실행 제한), Provisioned Concurrency(콜드스타트 방지·미리 워밍)", easy:"Reserved는 '심부름꾼 최대 10명까지만' 상한선 설정, Provisioned는 미리 대기시켜두기."},
      {label:"배포", text:"Zip 파일 or Container Image(최대 10GB). Lambda Layer로 공통 라이브러리 공유", easy:"Zip은 도시락 싸서 보내기, Container Image는 식당 통째로 배달. Layer는 공용 도구 창고."},
      {label:"시험 포인트", text:"VPC 내 배포 시 ENI 생성 → 콜드스타트 증가. 15분 초과 작업은 ECS/Fargate 사용. SQS는 배치 처리 가능", easy:"Lambda를 VPC 안에 넣으면 콜드스타트가 길어져. 15분 넘는 일은 ECS에 맡겨!"},
    ]
  },
  s3: {
    title:"Amazon S3", subtitle:"Simple Storage Service",
    easy:"S3는 인터넷 거대 창고야! 용량이 무한대고 자주 꺼내는 건 Standard, 가끔 꺼내는 건 Glacier에 넣으면 싸.",
    points:[
      {label:"스토리지 클래스", text:"Standard → Standard-IA → One Zone-IA → Glacier Instant → Glacier Flexible → Deep Archive", easy:"자주 쓰는 건 거실(Standard), 가끔 쓰는 건 창고(IA), 거의 안 쓰는 건 냉동창고(Glacier)."},
      {label:"보안", text:"Bucket Policy(리소스 기반), IAM Policy(사용자 기반), ACL(레거시), Presigned URL(임시 접근), OAC", easy:"Bucket Policy는 창고 문 규칙, IAM은 직원 출입증, Presigned URL은 임시 방문증."},
      {label:"기능", text:"Versioning, MFA Delete, Replication(CRR/SRR), Lifecycle(자동 전환·삭제)", easy:"구글 문서 버전 기록이랑 같아! 수정할 때마다 이전 버전이 남아서 실수로 지워도 복구 가능."},
      {label:"성능", text:"접두사당 초당 3,500 PUT / 5,500 GET. 멀티파트 업로드(100MB 이상 권장, 5GB 이상 필수)", easy:"큰 짐을 여러 조각으로 나눠서 동시에 보내는 거야(멀티파트). 여러 상자로 나눠 보내면 더 빨라!"},
      {label:"시험 포인트", text:"S3 버킷은 글로벌이지만 데이터는 리전에 저장. CORS 설정. 정적 웹사이트 호스팅 가능", easy:"S3 버킷 이름은 전 세계에서 하나뿐이어야 해. 데이터는 내가 선택한 리전에 저장돼."},
    ]
  },
  rds: {
    title:"Amazon RDS", subtitle:"Relational Database Service",
    easy:"RDS는 엑셀처럼 정리된 DB 창고야. AWS가 관리해줘서 백업도 자동이야.",
    points:[
      {label:"Multi-AZ", text:"동기 복제(Standby). 장애 시 자동 페일오버 60~120초. 읽기 불가(대기용). DNS 레코드 전환", easy:"응급 대기 병원이야! 주 병원이 닫히면 1~2분 안에 백업 병원이 자동으로 열려."},
      {label:"Read Replica", text:"비동기 복제. 읽기 분산용. 다른 리전 가능. 독립 DB로 승격 가능. 최대 5개", easy:"교과서 복사본이야! 원본이 바쁠 때 복사본을 여러 명이 나눠 읽을 수 있어."},
      {label:"백업", text:"자동 백업(1~35일), 수동 스냅샷(무기한 보관)", easy:"자동 백업은 매일 자동으로 찍히는 사진, 스냅샷은 직접 찍어서 영원히 보관."},
      {label:"암호화", text:"생성 시 KMS 암호화 설정. 이후 변경 불가(스냅샷 → 복사 → 암호화 복원 필요)", easy:"금고 만들 때만 자물쇠 선택 가능. 나중에 바꾸려면 내용물 꺼내서 새 금고에 넣어야 해."},
      {label:"시험 포인트", text:"Multi-AZ ≠ 읽기 분산(그건 Read Replica). RDS Proxy로 Lambda 연결 풀링. 스토리지 자동 확장", easy:"Multi-AZ는 '안전'(백업), Read Replica는 '속도'(분산). 시험에 무조건 나와!"},
    ]
  },
  aurora: {
    title:"Amazon Aurora", subtitle:"AWS 최적화 관계형 DB",
    easy:"Aurora는 RDS의 슈퍼 버전! 3개 AZ에 6개 복사본으로 저장해. MySQL보다 5배 빠른데 가격은 비슷해!",
    points:[
      {label:"아키텍처", text:"스토리지 자동 10GB~128TB. 3개 AZ에 6개 복본. 2개 실패해도 쓰기, 3개 실패해도 읽기 가능", easy:"같은 책을 3개 도서관에 6권씩 나눠 놓는 거야. 도서관 2개가 불타도 책은 안전해."},
      {label:"성능", text:"MySQL 대비 5배, PostgreSQL 대비 3배 빠름. Aurora Parallel Query", easy:"일반 RDS가 자전거라면 Aurora는 스포츠카야. MySQL 코드 그대로 5배 빠른 성능!"},
      {label:"기능", text:"Aurora Serverless v2: 자동 스케일링. Global Database: 리전간 1초 미만 복제", easy:"Serverless v2는 손님 수에 따라 테이블 자동 조절. Global DB는 한국→미국 1초 안에 반영."},
      {label:"Aurora vs RDS", text:"Aurora: 고성능·고가용성 필요 시. RDS: Oracle, SQL Server 등 특정 엔진 필요 시", easy:"Aurora는 AWS 특별 고성능 엔진, RDS는 특정 회사 DB를 쓰고 싶을 때."},
      {label:"시험 포인트", text:"Aurora Replica는 동일 스토리지 공유(복제 지연 없음). Backtrack으로 시점 되돌리기", easy:"Aurora Replica는 같은 창고를 공유해서 복사 시간이 0에 가까워."},
    ]
  },
  vpc: {
    title:"Amazon VPC", subtitle:"Virtual Private Cloud",
    easy:"VPC는 AWS 안에 울타리 쳐진 내 동네야! Public은 인터넷 접근 가능, Private은 내부만.",
    points:[
      {label:"구성 요소", text:"Subnet(Public/Private), Route Table, IGW, NAT Gateway, VPC Peering", easy:"공개 구역(Public)은 외부인 출입 가능, 비공개 구역(Private)은 주민만. NAT는 쪽문."},
      {label:"보안", text:"Security Group: Stateful, 허용만. NACL: Stateless, 허용+거부, 서브넷 레벨", easy:"SG는 집 현관문(자동 허용), NACL은 동네 경비원(둘 다 확인). SG는 허용만, NACL은 거부도."},
      {label:"연결", text:"VPN, Direct Connect(전용선), Transit Gateway(여러 VPC 허브 연결)", easy:"VPN은 일반 도로, Direct Connect는 전용 고속도로, Transit Gateway는 허브 교차로."},
      {label:"엔드포인트", text:"Gateway Endpoint: S3, DynamoDB(무료). Interface Endpoint: 나머지(ENI, 비용 발생)", easy:"VPC 안에서 S3 접근 시 Gateway Endpoint는 무료 출장소 설치!"},
      {label:"시험 포인트", text:"SG는 Stateful, NACL은 Stateless. NAT Gateway는 Public Subnet에 위치", easy:"SG는 스마트(자동 허용), NACL은 깐깐(둘 다 설정). NAT는 공개구역에 설치해야 해!"},
    ]
  },
  iam: {
    title:"AWS IAM", subtitle:"Identity and Access Management",
    easy:"IAM은 회사 출입증 관리 시스템이야! 직원마다 출입증을 주고, 팀별로 권한을 묶어줘.",
    points:[
      {label:"구성 요소", text:"User(개인), Group(집합), Role(임시 권한 위임), Policy(JSON 권한 문서)", easy:"User는 직원, Group은 팀, Role은 임시 출입증, Policy는 규칙서."},
      {label:"Policy 종류", text:"Identity-based, Resource-based, Permission Boundary, SCP(Organizations)", easy:"Identity-based는 직원 출입증 권한, Resource-based는 방 문 안내판, SCP는 회사 최상위 규정."},
      {label:"STS", text:"AssumeRole로 임시 자격증명. 크로스 계정 접근, EC2 Instance Profile, Web Identity Federation", easy:"STS는 임시 입장권 발급소! 다른 계정이나 외부 사람에게 시간제한 임시 출입증 발급."},
      {label:"Best Practice", text:"루트 계정 미사용, MFA, 최소 권한 원칙, Access Key 교체, CloudTrail 감사", easy:"루트 계정은 대표이사 도장 — 일상적으로 쓰면 안 돼. 최소 권한만 주는 게 최고!"},
      {label:"시험 포인트", text:"Policy 평가: 명시적 Deny > SCP > Permission Boundary > Identity > Resource Policy", easy:"명시적 거부(Deny)가 있으면 무조건 차단! 다른 허용이 있어도 Deny 하나면 끝."},
    ]
  },
  sqs: {
    title:"Amazon SQS", subtitle:"Simple Queue Service",
    easy:"SQS는 우체통이야! 편지를 넣어두면 배달부가 나중에 꺼내서 처리해. 바빠도 편지는 안전하게 보관돼!",
    points:[
      {label:"타입", text:"Standard: 최소 1회(중복 가능), 순서 미보장, 높은 처리량. FIFO: 정확히 1회, 순서 보장, 300~3000 TPS", easy:"Standard는 일반 우편(빠르지만 중복 가능), FIFO는 등기우편(느리지만 정확히 한 번)."},
      {label:"주요 설정", text:"Visibility Timeout(기본 30초), Message Retention(1분~14일), Max Size: 256KB", easy:"Visibility Timeout은 배달부가 꺼낸 후 다른 배달부가 못 보게 숨기는 시간."},
      {label:"DLQ", text:"Dead Letter Queue. 처리 실패 메시지 격리. maxReceiveCount 초과 시 이동", easy:"배달 실패한 편지 모아두는 특별 우체통. 왜 실패했는지 나중에 확인 가능."},
      {label:"Long Polling", text:"빈 큐 폴링 줄여 비용 절감. WaitTimeSeconds 1~20초. Short Polling보다 권장", easy:"Short Polling은 1초마다 확인, Long Polling은 '편지 올 때까지 최대 20초 기다려'."},
      {label:"시험 포인트", text:"SQS → Lambda 배치 처리. Fan-out: SNS → 여러 SQS. FIFO는 .fifo 접미사 필수", easy:"Fan-out은 SNS가 방송하면 여러 SQS가 동시에 받는 구조."},
    ]
  },
  cloudwatch: {
    title:"Amazon CloudWatch", subtitle:"모니터링 & 관찰 서비스",
    easy:"CloudWatch는 AWS의 CCTV + 알람이야! 서버 상태를 지켜보다가 이상하면 알려줘!",
    points:[
      {label:"Metrics", text:"기본 5분(무료), 세부 1분(유료). 커스텀 메트릭 가능", easy:"기본 CCTV는 5분마다 사진(무료), 고화질은 1분마다(유료)."},
      {label:"Logs", text:"Log Group → Log Stream. Log Insights로 쿼리. Metric Filter로 로그→메트릭 변환", easy:"Log Group은 일기장, Log Stream은 날짜별 페이지. Insights로 검색처럼 찾을 수 있어."},
      {label:"Alarms", text:"OK/ALARM/INSUFFICIENT_DATA. 액션: SNS, EC2 중지/종료, ASG 스케일링", easy:"CPU 90% 넘으면 문자 알림! 심각하면 자동으로 서버 늘리기(ASG)."},
      {label:"Events/EventBridge", text:"AWS 이벤트 감지 → 자동화. Cron/Rate 스케줄 실행", easy:"'매일 밤 12시에 백업 실행' 같은 자동화 규칙 설정."},
      {label:"시험 포인트", text:"EC2 메모리/디스크는 기본 메트릭 없음 → CloudWatch Agent 필요. 크로스 계정 수집 가능", easy:"EC2 메모리 모니터링은 Agent 설치해야 해! 시험에 자주 나와."},
    ]
  },
  elb: {
    title:"Elastic Load Balancer", subtitle:"트래픽 분산 서비스",
    easy:"ELB는 놀이공원 안내원이야! 사람이 몰리면 골고루 나눠줘!",
    points:[
      {label:"ALB (L7)", text:"HTTP/HTTPS. 경로/헤더/쿼리 라우팅. Lambda·컨테이너 대상. WebSocket. WAF 통합", easy:"URL 보고 안내하는 스마트 안내원. '/api'는 API 서버로, '/images'는 이미지 서버로."},
      {label:"NLB (L4)", text:"TCP/UDP/TLS. 초고성능(수백만 RPS). Static IP. 극단적 저지연", easy:"내용 안 보고 빠르게 전달하는 배달부. 고정 IP를 줄 수 있어. 게임 서버용."},
      {label:"GWLB (L3)", text:"IP 패킷. 방화벽/IDS/IPS 앞에 배치. GENEVE 프로토콜", easy:"모든 트래픽을 보안 검사대 통과시키는 특수 안내원."},
      {label:"공통 기능", text:"Cross-Zone, Sticky Session, Connection Draining, Health Check", easy:"Cross-Zone은 여러 건물 직원한테 골고루 분배. Sticky Session은 같은 직원 배정."},
      {label:"시험 포인트", text:"ALB는 고정 IP 없음(DNS). NLB는 고정 IP. SSL/TLS 종료 가능", easy:"'고정 IP 필요' → NLB! ALB는 DNS 이름으로만 접근."},
    ]
  },
  dynamodb: {
    title:"Amazon DynamoDB", subtitle:"서버리스 NoSQL DB",
    easy:"DynamoDB는 서랍장이야! 뭐든 넣을 수 있고 1초에 수백만 번 꺼내고 넣을 수 있어!",
    points:[
      {label:"용량 모드", text:"On-Demand: 자동 대응. Provisioned: RCU/WCU 직접 설정, 더 저렴, Auto Scaling", easy:"On-Demand는 알아서 처리(비쌈), Provisioned는 미리 준비(저렴하지만 넘치면 오류)."},
      {label:"인덱스", text:"GSI: 다른 파티션+정렬 키, 별도 용량. LSI: 같은 파티션 키, 다른 정렬 키", easy:"GSI는 완전히 새 주소록, LSI는 같은 주소록에 다른 정렬 기준 추가."},
      {label:"DAX", text:"인메모리 캐시. 마이크로초 응답. API 호환. 읽기 10배 향상", easy:"서랍 앞 메모지! 자주 꺼내는 건 메모지에서 바로 꺼내면 10배 빨라."},
      {label:"고급 기능", text:"DynamoDB Streams → Lambda. Global Tables: 멀티 리전 액티브-액티브. TTL: 자동 삭제", easy:"Global Tables는 한국→미국 자동 복사. TTL은 유통기한 설정."},
      {label:"시험 포인트", text:"파티션 키 설계 핵심(균등 분산). RCU=4KB/초, WCU=1KB/초. Transactions ACID 지원", easy:"파티션 키가 한쪽으로 치우치면 Hot Partition 발생. 다양한 값을 파티션 키로!"},
    ]
  },
  kms: {
    title:"AWS KMS", subtitle:"Key Management Service",
    easy:"KMS는 금고 열쇠 관리소야! 암호화 열쇠를 만들고 보관해줘. 누가 썼는지 기록도 남아!",
    points:[
      {label:"키 종류", text:"AWS Managed Key(무료), Customer Managed Key($1/월), CloudHSM(전용 하드웨어)", easy:"AWS 관리 마스터키(무료), 직접 만든 열쇠(월 $1), CloudHSM은 금고 하드웨어 통째로 빌리기."},
      {label:"Envelope Encryption", text:"DEK로 데이터 암호화 → DEK를 CMK로 암호화. 대용량 데이터 표준 방식", easy:"봉투 안에 봉투! 데이터는 임시 열쇠로 잠그고, 그 열쇠를 다시 마스터키로 잠가."},
      {label:"통합 서비스", text:"S3(SSE-KMS), EBS, RDS, Secrets Manager, SSM Parameter Store", easy:"거의 모든 AWS 서비스와 연결돼 있어. KMS 키 선택하면 자동 암호화."},
      {label:"키 정책", text:"KMS는 리소스 기반 정책 필수. IAM Policy만으론 접근 불가. Cross-account 시 키 정책 명시 필요", easy:"KMS 열쇠는 특별 — IAM 권한만으로 쓸 수 없어. 열쇠 정책에 직접 써줘야 해."},
      {label:"시험 포인트", text:"암호화된 EBS 스냅샷 공유 시 CMK도 공유. 키 삭제 최소 7일 대기", easy:"암호화 스냅샷 공유할 때 열쇠도 같이 줘야 해! 키 삭제는 7일 유예기간."},
    ]
  },
  cloudfront: {
    title:"Amazon CloudFront", subtitle:"글로벌 CDN",
    easy:"CloudFront는 전 세계에 미리 물건을 갖다 놓는 배달 시스템이야! 가까운 창고에서 가져와서 빠르게!",
    points:[
      {label:"오리진", text:"S3, ALB, EC2, HTTP 서버. OAC로 S3를 CloudFront 전용 제한", easy:"원본 창고에서 전 세계 엣지 창고에 복사해둬. OAC는 CloudFront 전용 자물쇠."},
      {label:"캐싱", text:"TTL(기본 24시간). Cache Policy. Invalidation으로 즉시 무효화", easy:"한 번 로드하면 캐시에 저장. TTL 동안 저장해두다가 시간 지나면 새로 가져와."},
      {label:"보안", text:"HTTPS 강제. WAF 통합. Geo Restriction. Field Level Encryption", easy:"WAF로 해킹 방어. Geo Restriction으로 특정 나라 접근 차단."},
      {label:"엣지 컴퓨팅", text:"Lambda@Edge: CloudFront 이벤트에서 Lambda 실행. CloudFront Functions: 경량 JS", easy:"엣지에서 직접 코드 실행! 언어 자동 번역, 로그인 확인 등을 서버까지 안 가고 처리."},
      {label:"시험 포인트", text:"글로벌 서비스(us-east-1에서만 인증서). 동적 콘텐츠도 가속. Signed URL/Cookie로 유료 콘텐츠 보호", easy:"CloudFront용 SSL 인증서는 꼭 us-east-1에서! Signed URL은 유료 콘텐츠 보호."},
    ]
  },
  route53: {
    title:"Amazon Route 53", subtitle:"DNS 및 트래픽 라우팅",
    easy:"Route53은 인터넷 전화번호부! www.naver.com을 실제 IP 주소로 바꿔줘.",
    points:[
      {label:"라우팅 정책", text:"Simple, Weighted, Latency, Failover, Geolocation, Geoproximity, Multi-Value", easy:"Weighted는 A/B 테스트, Latency는 제일 빠른 서버, Failover는 백업 서버."},
      {label:"헬스체크", text:"엔드포인트 모니터링. 15개 글로벌 헬스체커. Failover 필수 조합", easy:"30초마다 서버에 '살아있어?' 확인. 응답 없으면 다른 서버로 돌려줘."},
      {label:"레코드 타입", text:"A(IPv4), AAAA(IPv6), CNAME(도메인→도메인), Alias(AWS 리소스, Zone Apex 가능, 무료)", easy:"A는 이름→주소, CNAME은 이름→다른 이름, Alias는 AWS 전용이고 무료."},
      {label:"도메인", text:"도메인 구매 가능. Public vs Private Hosted Zone. DNSSEC 지원", easy:"Route53에서 도메인도 살 수 있어. Private은 VPC 안에서만 쓰는 내부 전화번호부."},
      {label:"시험 포인트", text:"Alias는 ELB, CloudFront, S3에 사용. CNAME은 Zone Apex 불가. Alias 무조건 선택!", easy:"루트 도메인에는 CNAME 못 써, Alias만! AWS 서비스 연결은 무조건 Alias!"},
    ]
  },
  sns: {
    title:"Amazon SNS", subtitle:"Simple Notification Service",
    easy:"SNS는 방송 시스템이야! 마이크에 외치면 구독자 모두가 동시에 들어!",
    points:[
      {label:"개요", text:"Pub/Sub. Publisher → Topic → Subscribers (SQS, Lambda, Email, SMS, HTTP)", easy:"라디오 방송! 방송국이 외치면 라디오들이 동시에 수신해."},
      {label:"Fan-out 패턴", text:"SNS Topic → 여러 SQS Queue. 병렬 처리. 느슨한 결합", easy:"주문 완료 하나로 재고 차감, 영수증 발송, 포인트 적립 동시 처리!"},
      {label:"FIFO Topic", text:"SQS FIFO와 조합. 순서 보장 + 중복 제거. 금융·재고 시스템", easy:"은행 순번표! 순서대로 처리하고 같은 번호 두 번 발급 안 해."},
      {label:"메시지 필터링", text:"Subscription Filter Policy. JSON 속성 기반. 비용 절감·효율화", easy:"'빨간 봉투만 받을게' 처럼 원하는 조건의 메시지만 골라 받기."},
      {label:"시험 포인트", text:"SNS는 푸시(SQS는 폴링). 메시지 영속성 없음. DLQ는 SQS에 설정", easy:"SNS는 방송이라 저장 안 해. 저장 필요하면 SQS에 받아둬야 해."},
    ]
  },
  kinesis: {
    title:"Amazon Kinesis", subtitle:"실시간 데이터 스트리밍",
    easy:"Kinesis는 강물 같은 데이터 파이프! 계속 흘러나오는 데이터를 받아서 처리해줘.",
    points:[
      {label:"Data Streams", text:"실시간. 샤드 단위(1MB입력/2MB출력). 보관 24시간~365일. 직접 소비자 관리", easy:"파이프! 샤드가 많을수록 더 많은 데이터 흘릴 수 있어."},
      {label:"Firehose", text:"완전 관리형. S3/Redshift/OpenSearch에 자동 전달. 버퍼링. Near Real-time", easy:"자동으로 탱크에 채워주는 시스템. 관리 안 해도 돼."},
      {label:"Data Analytics", text:"SQL로 실시간 분석. 이상 감지·집계", easy:"흘러가는 데이터를 보면서 실시간 SQL 분석."},
      {label:"vs SQS", text:"Kinesis: 대용량 스트리밍, 다중 소비자, 순서 보장. SQS: 메시지 큐, 단일 소비자, 처리 후 삭제", easy:"Kinesis는 여러 명이 같은 강물을 볼 수 있어. SQS는 한 사람이 꺼내면 사라져."},
      {label:"시험 포인트", text:"샤드 수 = 처리량. Hot Partition 방지. Firehose는 Lambda로 변환 가능", easy:"특정 샤드에 데이터 몰리면 병목! 파티션 키 분산이 중요해."},
    ]
  },
  elasticache: {
    title:"Amazon ElastiCache", subtitle:"인메모리 캐시",
    easy:"ElastiCache는 책상 위 메모지! 자주 보는 내용을 DB에서 매번 꺼내면 느리니까 메모리에 적어두면 빨라!",
    points:[
      {label:"Redis vs Memcached", text:"Redis: 영속성, 복제, Multi-AZ, 자료구조, Pub/Sub. Memcached: 단순, 멀티스레드, 샤딩", easy:"Redis는 전원 있는 고급 메모지(안 지워짐), Memcached는 일반 메모지(사라짐)."},
      {label:"캐싱 전략", text:"Lazy Loading(캐시 미스 시 저장), Write Through(쓰기 시 캐시 업데이트), TTL 만료", easy:"Lazy Loading은 '없으면 가져와서 메모', Write Through는 '쓸 때마다 메모도 업데이트'."},
      {label:"사용 사례", text:"DB 캐싱, 세션 저장소, 실시간 리더보드, Rate Limiting", easy:"게임 순위표, 쇼핑몰 장바구니, API 호출 제한 등에 사용."},
      {label:"Redis Cluster", text:"데이터 샤딩 수평 확장. 최대 500노드. Multi-AZ + 자동 페일오버", easy:"메모지가 많아지면 여러 책상에 나눠 적어. 더 많이, 더 빠르게!"},
      {label:"시험 포인트", text:"RDS 앞에 ElastiCache → 읽기 부하 감소. 세션 관리 → Redis. Memcached는 영속성 없음", easy:"RDS 느리다 → ElastiCache 캐싱! 세션 저장 → Redis!"},
    ]
  },
  ebs: {
    title:"Amazon EBS", subtitle:"Elastic Block Store",
    easy:"EBS는 EC2에 꽂는 USB 하드디스크! 컴퓨터 꺼도 USB는 사라지지 않아. 같은 AZ에서만 쓸 수 있어!",
    points:[
      {label:"볼륨 타입", text:"gp3(범용, 3000 IOPS), io2(프로비저닝 IOPS, DB용), st1(처리량 HDD), sc1(콜드 HDD, 최저가)", easy:"gp3는 일반 SSD, io2는 고급 SSD(DB용), st1은 대용량 HDD, sc1은 제일 싼 HDD."},
      {label:"특성", text:"단일 AZ. 1:1 연결(io1/io2는 Multi-Attach). 네트워크 드라이브. 독립 수명", easy:"네트워크로 연결된 USB. EC2 꺼도 살아있어. 같은 AZ에서만 연결 가능."},
      {label:"스냅샷", text:"증분 백업. S3 저장. 다른 AZ/리전 복사. Snapshot Archive(75% 저렴)", easy:"USB 사진 찍기! 처음엔 전체, 그다음엔 바뀐 부분만 찍어 저장."},
      {label:"암호화", text:"KMS 사용. 미암호화 → 스냅샷 → 암호화 복사 → 복원으로 변환", easy:"USB에 자물쇠! 처음 만들 때만 설정. 나중에 바꾸려면 3단계 필요."},
      {label:"시험 포인트", text:"루트 볼륨 기본 삭제(종료 시). gp3가 gp2보다 저렴+IOPS 독립. RAID 0 성능 향상", easy:"EC2 종료하면 루트 EBS 기본 삭제! 중요 데이터는 스냅샷 필수. gp3가 gp2보다 좋아."},
    ]
  },
  efs: {
    title:"Amazon EFS", subtitle:"Elastic File System",
    easy:"EFS는 여러 컴퓨터가 동시에 쓸 수 있는 공유 폴더! EBS가 혼자 쓰는 USB라면 EFS는 공용 파일서버!",
    points:[
      {label:"특성", text:"완전 관리형 NFS. 다중 EC2 마운트. Multi-AZ. 자동 확장/축소. Linux 전용", easy:"여러 EC2가 동시에 같은 폴더 열어서 파일 읽고 쓸 수 있어. Linux만!"},
      {label:"성능 모드", text:"General Purpose(기본, 저지연). Max I/O(높은 처리량, 빅데이터용)", easy:"General Purpose는 일반 도로(빠른 반응), Max I/O는 고속도로(많은 양)."},
      {label:"처리량 모드", text:"Bursting, Provisioned(고정), Elastic(자동 조절)", easy:"Bursting은 가끔 터뜨리기, Provisioned는 고정 속도, Elastic은 알아서 조절."},
      {label:"스토리지 클래스", text:"Standard, EFS-IA(비자주 접근), Archive. Lifecycle Policy 자동 이동", easy:"자주 쓰는 건 빠른 선반, 가끔 쓰는 건 창고. 자동으로 옮겨줘."},
      {label:"시험 포인트", text:"다중 EC2 공유 → EFS. Windows → FSx. EFS는 EBS보다 비싸지만 공유 가능", easy:"여러 EC2가 같은 파일 → EFS! Windows → FSx! EBS는 혼자, EFS는 함께!"},
    ]
  },
  cognito: {
    title:"Amazon Cognito", subtitle:"사용자 인증",
    easy:"Cognito는 앱의 회원가입/로그인 담당자! 구글/페이스북 로그인도 지원!",
    points:[
      {label:"User Pool", text:"회원 디렉토리. JWT 토큰 발급. 소셜 로그인. MFA. Lambda Trigger", easy:"회원 명단! 로그인 성공하면 출입증(JWT) 발급. 구글 계정 로그인도 가능!"},
      {label:"Identity Pool", text:"AWS 리소스 접근 임시 자격증명(STS). Unauthenticated 접근도 가능", easy:"AWS 서비스 쓸 수 있는 임시 열쇠 발급. S3 직접 업로드 가능."},
      {label:"플로우", text:"User Pool 인증 → JWT → Identity Pool → STS → S3/DynamoDB 접근", easy:"로그인 → 토큰 → AWS 임시열쇠 교환 → S3 직접 업로드. 중간서버 불필요!"},
      {label:"통합", text:"API Gateway: Cognito Authorizer. ALB: 인증 오프로드", easy:"API Gateway에서 토큰 진짜인지 Cognito가 확인해줘."},
      {label:"시험 포인트", text:"User Pool = 인증(AuthN), Identity Pool = 권한 부여(AuthZ). 모바일 앱 AWS 직접 접근 패턴", easy:"User Pool은 '너 누구?', Identity Pool은 '뭐 할 수 있어?'. 둘 합쳐야 모바일 앱에서 S3 접근!"},
    ]
  },
  ecs: {
    title:"Amazon ECS/EKS", subtitle:"컨테이너 오케스트레이션",
    easy:"ECS는 컨테이너 박스를 관리하는 반장! Fargate 쓰면 서버 관리를 AWS가 다 해줘!",
    points:[
      {label:"ECS vs EKS", text:"ECS: AWS 자체. EKS: 관리형 Kubernetes(오픈소스, 이식성 높음)", easy:"ECS는 AWS만의 방식, EKS는 쿠버네티스. 다른 클라우드 이사 가능하면 EKS."},
      {label:"런치 타입", text:"EC2: 직접 관리, 비용 절감. Fargate: 서버리스, 편리, 더 비쌈", easy:"EC2는 직접 관리(싸지만 일 많음), Fargate는 AWS가 관리(비싸지만 편함)."},
      {label:"Task & Service", text:"Task Definition: 컨테이너 설정. Service: Task 수 유지·ELB 연동·Auto Scaling", easy:"Task Definition은 레시피, Task는 요리 하나, Service는 '항상 3개 유지' 관리자."},
      {label:"스토리지", text:"EFS 마운트로 컨테이너 간 공유. S3는 앱 코드로 접근", easy:"컨테이너 껐다 켜면 파일 사라짐. 중요한 건 EFS에 저장!"},
      {label:"시험 포인트", text:"Fargate는 VPC/서브넷 필수. Task Role로 AWS 권한. ECS Anywhere로 온프레미스 실행", easy:"Fargate는 VPC 필수! AWS 권한은 Task Role에 — EC2 Instance Profile과 헷갈리지 마!"},
    ]
  },
  asg: {
    title:"Auto Scaling Group", subtitle:"자동 스케일링",
    easy:"ASG는 바쁠 때 직원 더 뽑고 한가할 때 줄이는 인사팀! 돈도 아껴줘!",
    points:[
      {label:"스케일링 정책", text:"Target Tracking(목표값 유지), Step(단계별), Scheduled(시간 기반), Predictive(ML 예측)", easy:"Target Tracking은 에어컨처럼 'CPU 50% 유지'. Scheduled는 시간표대로."},
      {label:"주요 설정", text:"Min/Max/Desired 인스턴스 수. Health Check(EC2/ELB). Cooldown(기본 300초)", easy:"'최소 2대, 최대 10대, 평소 3대'. Cooldown은 안정화 시간."},
      {label:"Launch Template", text:"AMI, 인스턴스 타입, SG, 키페어 등 설정", easy:"새 직원 채용 기준표. OS, 컴퓨터 사양, 보안 설정 미리 정해두기."},
      {label:"Lifecycle Hook", text:"인스턴스 시작/종료 시 커스텀 작업 실행", easy:"서버 켜질 때 '소프트웨어 설치 완료될 때까지 기다려' 설정."},
      {label:"시험 포인트", text:"ELB 연동 시 Health Check는 ELB 기준 권장. Spot 혼합으로 비용 절감", easy:"ELB 기준 Health Check가 정확해. Spot 섞으면 최대 90% 절감!"},
    ]
  },
  beanstalk: {
    title:"AWS Elastic Beanstalk", subtitle:"PaaS 플랫폼",
    easy:"Beanstalk은 코드만 갖다 주면 서버 세팅을 알아서 해주는 식당 주인!",
    points:[
      {label:"지원 환경", text:"Node.js, Python, Java, .NET, PHP, Ruby, Go, Docker", easy:"어떤 언어든 코드만 올리면 맞는 환경에서 실행!"},
      {label:"배포 방식", text:"All at once, Rolling, Rolling with batch, Immutable, Blue/Green", easy:"All at once는 동시 교체, Rolling은 순차, Blue/Green은 새로 만든 후 전환."},
      {label:"구성 요소", text:"Application → Environment(Web/Worker) → Application Version", easy:"Application은 회사, Environment는 개발팀/운영팀, Version은 배포 패키지."},
      {label:"설정", text:".ebextensions로 커스텀. CloudFormation 사용. RDS는 외부 권장", easy:".ebextensions로 세팅 커스텀. RDS는 따로 만들어야 안전해."},
      {label:"시험 포인트", text:"Beanstalk 자체 무료(리소스만 과금). Blue/Green 무중단 배포. Worker는 SQS 연동", easy:"Beanstalk 자체는 무료! Blue/Green으로 무중단 배포 가능!"},
    ]
  },
  glacier: {
    title:"S3 Glacier", subtitle:"장기 아카이빙",
    easy:"Glacier는 냉동창고! 자주 안 쓰는 서류를 싸게 보관. 꺼내는 데 시간이 걸려!",
    points:[
      {label:"세 가지 티어", text:"Instant(밀리초), Flexible(1~12시간), Deep Archive(12~48시간, 최저가)", easy:"Instant는 냉장고, Flexible는 냉동실, Deep Archive는 지하 얼음창고(가장 싸)."},
      {label:"비용", text:"S3 Standard 대비 최대 95% 저렴. 검색 비용 별도", easy:"Standard 대비 최대 95% 싸! 꺼낼 때만 요금 발생."},
      {label:"S3 Lifecycle", text:"Standard → IA → Glacier → Deep Archive 자동 전환", easy:"파일이 오래될수록 자동으로 더 싼 창고로 이사가게 설정."},
      {label:"Vault Lock", text:"WORM 정책. 규정 준수. 변경 불가", easy:"한번 저장하면 삭제 불가능. 법적 보관 의무에 사용."},
      {label:"시험 포인트", text:"Flexible 최소 90일, Deep Archive 최소 180일. 이전 삭제 시 잔여 요금 부과", easy:"Glacier는 최소 보관 기간 있어! 일찍 삭제하면 남은 요금 내야 해."},
    ]
  },
  redshift: {
    title:"Amazon Redshift", subtitle:"데이터 웨어하우스",
    easy:"Redshift는 분석용 도서관! '지난 3년간 가장 잘 팔린 상품은?' 같은 복잡한 분석에 빠르게 답해줘!",
    points:[
      {label:"아키텍처", text:"Leader Node(계획) + Compute Nodes(처리). 컬럼형 스토리지. 병렬 처리", easy:"Leader는 공장장, Compute는 직원. 여러 직원이 동시에 일해서 분석이 빨라."},
      {label:"Spectrum", text:"S3 데이터를 직접 쿼리. 데이터 이동 불필요", easy:"S3 파일을 Redshift로 직접 SQL 조회! 데이터 이동 안 해도 돼."},
      {label:"로딩", text:"COPY 명령으로 S3/DynamoDB에서 대량 로드. Kinesis Firehose로 실시간 적재", easy:"S3에서 COPY로 대량 가져오기. Firehose로 실시간 자동 적재."},
      {label:"클러스터", text:"RA3: 스토리지 분리(S3). DC2: 고성능 SSD. 서버리스 옵션", easy:"RA3는 컴퓨팅+저장 분리. 서버리스는 클러스터 관리 없이 쿼리만."},
      {label:"시험 포인트", text:"OLAP 전용. OLTP → RDS/Aurora. Multi-AZ 제한적(RA3만)", easy:"Redshift는 분석(OLAP)용! 실시간 처리(OLTP) → RDS/Aurora!"},
    ]
  },
  directconn: {
    title:"AWS Direct Connect", subtitle:"전용선 연결",
    easy:"Direct Connect는 전용 고속도로! 인터넷(VPN)은 일반 도로라 막힐 수 있지만 전용선은 항상 빠르고 안정적!",
    points:[
      {label:"특징", text:"물리 전용선. 일관된 성능. 1Gbps~100Gbps. 인터넷 경유 안 함", easy:"AWS까지 광케이블 직접 연결. 다른 트래픽 영향 안 받아."},
      {label:"연결 방식", text:"Dedicated: AWS에서 직접 포트 할당. Hosted: APN 파트너 통해 제공", easy:"Dedicated는 직접 케이블, Hosted는 중간 업체 통해 연결(더 빨리 설치)."},
      {label:"Virtual Interface", text:"Public VIF: S3 등 퍼블릭 접근. Private VIF: VPC 내부. Transit VIF: Transit GW", easy:"Public VIF는 공개 서비스용, Private VIF는 VPC 내부 접근용 차선."},
      {label:"고가용성", text:"2개 이상 이중화. VPN 백업 병행 권장. Direct Connect Gateway로 여러 리전", easy:"전용도로 하나 공사 중이면 곤란! 2개 이상 깔거나 VPN 백업 필요."},
      {label:"시험 포인트", text:"VPN보다 비싸지만 안정적. 설치 수주~수개월. 암호화 기본 없음(VPN over DX로 해결)", easy:"Direct Connect는 암호화 없어! 보안 필요하면 VPN도 같이 써야 해."},
    ]
  },
  waf: {
    title:"WAF & Shield", subtitle:"웹 방화벽 & DDoS 방어",
    easy:"WAF는 앱 앞의 경비원, Shield는 DDoS 방패!",
    points:[
      {label:"WAF", text:"L7 방화벽. SQL Injection, XSS 방어. IP/지역 차단. Rate Limiting. CloudFront, ALB, API GW 연결", easy:"이상한 요청(해킹 시도) 오면 막아라 규칙 설정. 나라나 IP 차단도 가능."},
      {label:"Web ACL & Rules", text:"규칙 그룹. AWS Managed Rules. 허용/차단/카운트 액션", easy:"AWS가 만들어둔 해킹 패턴 DB를 그대로 쓸 수도, 직접 규칙 추가도 가능."},
      {label:"Shield Standard", text:"무료. L3/L4 DDoS 자동 방어. SYN Flood, UDP Reflection 방어", easy:"무료 자동 방어막! 별도 설정 없이 항상 켜져 있어."},
      {label:"Shield Advanced", text:"$3,000/월. L7 DDoS. DRT 24/7 지원. 공격 비용 크레딧", easy:"월 $3,000 고급 방어! DDoS로 비용 폭증하면 AWS가 크레딧으로 돌려줘."},
      {label:"시험 포인트", text:"WAF는 CloudFront(글로벌) or ALB/API GW(리전). Shield Advanced는 Route53, CF, ELB, EC2 EIP", easy:"웹 해킹 방어 → WAF, DDoS 방어 → Shield!"},
    ]
  },
  secrets: {
    title:"AWS Secrets Manager", subtitle:"비밀값 관리",
    easy:"Secrets Manager는 비밀 금고! DB 비밀번호를 안전하게 저장하고 자동 교체!",
    points:[
      {label:"핵심 기능", text:"비밀값 저장·검색·교체 자동화. RDS 자격증명 자동 로테이션. KMS 암호화", easy:"비밀번호를 금고에 넣고 30일마다 자동 교체. 코드 변경 없이 최신 값 사용."},
      {label:"자동 로테이션", text:"Lambda로 주기적 교체. RDS 지원 DB는 기본 Lambda 제공", easy:"Lambda 로봇이 주기적으로 새 비밀번호 만들고 DB에 업데이트해줘."},
      {label:"vs Parameter Store", text:"Secrets Manager: 자동 로테이션, $0.40/월. Parameter Store: 무료, 로테이션 직접 구현", easy:"자동 교체 필요 → Secrets Manager! 무료 원하면 Parameter Store."},
      {label:"접근 제어", text:"IAM + Resource-based Policy. VPC Endpoint로 인터넷 없이 접근", easy:"개발팀은 개발 DB 비번만, 운영팀은 운영 DB 비번만 볼 수 있게 제어."},
      {label:"시험 포인트", text:"RDS 비밀번호 → Secrets Manager. Lambda 환경변수 하드코딩 금지", easy:"DB 비밀번호 어디에? → Secrets Manager! Lambda에 직접 적으면 절대 안 돼!"},
    ]
  },
  eventbridge: {
    title:"Amazon EventBridge", subtitle:"이벤트 버스",
    easy:"EventBridge는 이벤트 중계소! 어떤 일이 생기면 자동으로 다른 서비스에 연결!",
    points:[
      {label:"이벤트 버스", text:"Default(AWS), Custom(앱), Partner(SaaS: Zendesk, Shopify). 계정 간 전송 가능", easy:"AWS 서비스, 내 앱, 외부 서비스 이벤트를 각각 다른 채널로 받아."},
      {label:"Rules", text:"패턴 매칭으로 타겟 실행. Cron/Rate 스케줄. 최대 5개 타겟. 입력 변환", easy:"'이런 이벤트 오면 실행' 규칙. Cron으로 스케줄러도 가능."},
      {label:"타겟", text:"Lambda, SQS, SNS, ECS, Step Functions, API Gateway, Kinesis 등 20+", easy:"Lambda 실행, SQS 메시지, SNS 알림 등 20가지 이상 서비스와 연결."},
      {label:"Archive & Replay", text:"이벤트 아카이빙 후 재처리. 디버깅·재시도·테스트 활용", easy:"과거 이벤트를 다시 재생! 버그 수정 후 그 시점부터 다시 실행 가능."},
      {label:"시험 포인트", text:"CloudWatch Events의 업그레이드. SaaS 파트너 연동은 EventBridge만. Pipe 파이프라인", easy:"외부 서비스 이벤트를 AWS로 받으려면 EventBridge만 가능!"},
    ]
  },
  cloudtrail: {
    title:"AWS CloudTrail", subtitle:"API 감사 로그",
    easy:"CloudTrail은 AWS 블랙박스! 누가 언제 어떤 서버를 만들었는지 다 기록!",
    points:[
      {label:"이벤트 유형", text:"Management Events(API 호출, 기본 활성화), Data Events(S3/Lambda, 별도 설정), Insight Events(비정상 감지)", easy:"Management는 '누가 EC2 만들었다', Data는 'S3 파일 열었다' 같은 세부 기록."},
      {label:"저장", text:"기본 90일(콘솔). S3 저장 시 무기한. CloudWatch Logs 실시간. Athena 분석", easy:"콘솔에서 90일만 보여. S3에 저장하면 영원히. Athena로 SQL 분석도 가능."},
      {label:"Trail", text:"단일 리전 or 모든 리전. 조직 Trail: Organizations 전체 중앙 수집. 무결성 검증", easy:"전 세계 모든 지역 기록을 한 곳에 모을 수 있어."},
      {label:"보안", text:"SSE-KMS 암호화. S3 접근 제어. MFA Delete 삭제 방지", easy:"로그 파일은 KMS로 암호화. MFA 있어야만 삭제 가능 — 증거 인멸 방지!"},
      {label:"시험 포인트", text:"CloudTrail ≠ CloudWatch. '누가 삭제?' → CloudTrail. '서버 왜 느려?' → CloudWatch", easy:"CloudTrail은 감사일지(누가 뭘 했나), CloudWatch는 성능 모니터링. 다른 목적!"},
    ]
  },
  apigw: {
    title:"Amazon API Gateway", subtitle:"API 관리",
    easy:"API Gateway는 앱의 현관문! 요청을 받아서 Lambda, EC2에 전달하고 Throttling, Caching도 해줘!",
    points:[
      {label:"API 타입", text:"REST(풀기능·캐싱), HTTP(70% 저렴·빠름), WebSocket(실시간 양방향)", easy:"REST는 풀옵션 자동문, HTTP는 기본 문(저렴), WebSocket은 채팅·게임용."},
      {label:"통합", text:"Lambda Proxy, AWS 서비스 직접(S3, DynamoDB), HTTP 백엔드, Mock", easy:"Lambda Proxy는 전화 연결, 직접 통합은 DynamoDB 바로 조회, Mock은 테스트용 더미."},
      {label:"보안", text:"IAM, Cognito Authorizer, Lambda Authorizer, Resource Policy(IP/VPC 제한)", easy:"IAM은 사원증, Cognito는 회원 토큰, Lambda Authorizer는 커스텀 확인."},
      {label:"성능", text:"Throttling: 기본 10,000 RPS. 캐싱: TTL 300초. Stage별 배포(dev/prod)", easy:"요청 폭주 시 번호표 대기. 자주 묻는 건 캐시. dev/prod 분리 관리."},
      {label:"시험 포인트", text:"Edge-Optimized(글로벌), Regional(한 리전), Private(VPC). WebSocket → 실시간 채팅", easy:"전 세계 → Edge, 한 리전 → Regional, 내부망 → Private. 실시간 채팅 → WebSocket!"},
    ]
  },
};

export const CONCEPTS_JA: Record<string, Concept> = {
  ec2: {
    title:"Amazon EC2", subtitle:"Elastic Compute Cloud",
    easy:"EC2はインターネット上の自分のコンピューター! 必要な時だけ借りて料金を払う仕組み。常に使うなら事前に予約すると最大72%安く使える。",
    points:[
      {label:"インスタンス購入オプション", text:"On-Demand(柔軟), Reserved(1~3年契約 最大72%割引), Spot(最大90%割引、いつでも終了可能), Dedicated Host(物理サーバー専用)", easy:"On-Demandは当日レンタル(高い), Reservedは1年長期契約(安い), Spotは空き車の超特価でいつでも返却可能。"},
      {label:"AMI", text:"Amazon Machine Image. インスタンスのOS・ソフトウェアテンプレート。カスタムAMIで高速デプロイ可能。リージョン間でコピー可能", easy:"クッキー型のようなもの! 1つの型(AMI)を作ったら、同じ形のクッキー(サーバー)をいくつでも素早く量産できる。"},
      {label:"Placement Group", text:"Cluster(同じAZ、低レイテンシ), Spread(異なるハードウェア、障害の分離), Partition(大規模分散システム)", easy:"教室の座席配置のようなもの! Clusterはチームメンバー固まって座る(素早い通信), Spreadはわざと離れて座る(一人が欠席しても他のチーム影響なし)。"},
      {label:"ストレージ", text:"EBS(永続ブロック), Instance Store(一時的・高速), EFS(共有ファイルシステム)", easy:"EBSは個人ロッカー(オフでも保持), Instance Storeは机の上のメモ(オフで消える), EFSは共用キャビネット(みんなで使える)。"},
      {label:"試験ポイント", text:"Spot Instance中断時に2分警告。Reservedはスコープを選択可(AZまたはリージョン)。HibernateでRAM保持状態で停止可能", easy:"Spotはカラオケの空き部屋 — 他の客が予約したら2分以内に出ないといけない! HibernateはノートPC省電力モード — オフにして再度オンにしても作業が同じままだ。"},
    ]
  },
};

