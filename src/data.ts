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

export const NODES: AWSNode[] = [
  { id:"ec2",        name:"EC2",             cat:"compute",   emoji:"🖥️", desc:"가상 서버 · AMI · Spot/Reserved · Placement Group" },
  { id:"lambda",     name:"Lambda",          cat:"compute",   emoji:"λ",  desc:"서버리스 함수 · 최대 15분 · 이벤트 트리거 · Concurrency" },
  { id:"ecs",        name:"ECS/EKS",         cat:"compute",   emoji:"🐳", desc:"컨테이너 · Fargate(서버리스) vs EC2 런치타입" },
  { id:"asg",        name:"Auto Scaling",    cat:"compute",   emoji:"📈", desc:"자동 스케일링 · Target Tracking / Step / Scheduled" },
  { id:"beanstalk",  name:"Beanstalk",       cat:"compute",   emoji:"🫘", desc:"PaaS · 코드만 올리면 인프라 자동 관리" },
  { id:"s3",         name:"S3",              cat:"storage",   emoji:"🪣", desc:"객체 스토리지 · Storage Class · Lifecycle · Versioning" },
  { id:"ebs",        name:"EBS",             cat:"storage",   emoji:"💾", desc:"블록 스토리지 · EC2 attach · gp3/io2/st1/sc1 · 단일 AZ" },
  { id:"efs",        name:"EFS",             cat:"storage",   emoji:"📁", desc:"네트워크 파일시스템 · 여러 EC2 동시 마운트 · Multi-AZ" },
  { id:"glacier",    name:"S3 Glacier",      cat:"storage",   emoji:"🧊", desc:"장기 아카이빙 · Instant/Flexible/Deep Archive" },
  { id:"rds",        name:"RDS",             cat:"database",  emoji:"🗄️", desc:"관리형 RDBMS · Multi-AZ · Read Replica · 자동 백업" },
  { id:"aurora",     name:"Aurora",          cat:"database",  emoji:"✨", desc:"AWS 최적화 DB · MySQL/PostgreSQL 호환 · 6개 복제본" },
  { id:"dynamodb",   name:"DynamoDB",        cat:"database",  emoji:"⚡", desc:"서버리스 NoSQL · DAX 캐시 · Global Tables" },
  { id:"elasticache",name:"ElastiCache",     cat:"database",  emoji:"🚀", desc:"인메모리 캐시 · Redis(영속성) vs Memcached(단순)" },
  { id:"redshift",   name:"Redshift",        cat:"database",  emoji:"📊", desc:"데이터 웨어하우스 · OLAP · Spectrum으로 S3 쿼리" },
  { id:"vpc",        name:"VPC",             cat:"network",   emoji:"🌐", desc:"가상 네트워크 · Subnet · IGW · NAT Gateway · SG" },
  { id:"elb",        name:"ELB",             cat:"network",   emoji:"⚖️", desc:"로드밸런서 · ALB(L7) · NLB(L4) · GWLB" },
  { id:"cloudfront", name:"CloudFront",      cat:"network",   emoji:"☁️", desc:"CDN · 엣지 캐싱 · OAC로 S3 보호 · Lambda@Edge" },
  { id:"route53",    name:"Route 53",        cat:"network",   emoji:"🔀", desc:"DNS · Weighted/Latency/Failover/Geolocation" },
  { id:"apigw",      name:"API Gateway",     cat:"network",   emoji:"🚪", desc:"API 관리 · REST/WebSocket · Lambda 통합 · Throttling" },
  { id:"directconn", name:"Direct Connect",  cat:"network",   emoji:"🔌", desc:"전용선 연결 · 안정적 대역폭 · VPN보다 일관된 성능" },
  { id:"iam",        name:"IAM",             cat:"security",  emoji:"🔐", desc:"권한 관리 · Role/Policy · STS AssumeRole" },
  { id:"kms",        name:"KMS",             cat:"security",  emoji:"🔑", desc:"키 관리 · CMK · S3/EBS/RDS 암호화 · Envelope Encryption" },
  { id:"waf",        name:"WAF & Shield",    cat:"security",  emoji:"🛡️", desc:"WAF: L7 방화벽 · Shield Standard/Advanced: DDoS 방어" },
  { id:"cognito",    name:"Cognito",         cat:"security",  emoji:"👤", desc:"사용자 인증 · User Pool(인증) + Identity Pool" },
  { id:"secrets",    name:"Secrets Manager", cat:"security",  emoji:"🗝️", desc:"비밀값 관리 · DB 비번 자동 로테이션" },
  { id:"sqs",        name:"SQS",             cat:"messaging", emoji:"📬", desc:"메시지 큐 · Standard vs FIFO · DLQ · Visibility Timeout" },
  { id:"sns",        name:"SNS",             cat:"messaging", emoji:"📣", desc:"Pub/Sub · Topic → 여러 구독자 · Fan-out 패턴" },
  { id:"eventbridge",name:"EventBridge",     cat:"messaging", emoji:"🌉", desc:"이벤트 버스 · 이벤트 기반 아키텍처 · 스케줄러" },
  { id:"kinesis",    name:"Kinesis",         cat:"messaging", emoji:"🌊", desc:"실시간 스트리밍 · Data Streams/Firehose/Analytics" },
  { id:"cloudwatch", name:"CloudWatch",      cat:"monitor",   emoji:"👁️", desc:"모니터링 · Metrics/Logs/Alarms/Dashboards" },
  { id:"cloudtrail", name:"CloudTrail",      cat:"monitor",   emoji:"📝", desc:"API 감사 로그 · 누가 뭘 언제 · S3 저장" },
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

export const CAT = {
  compute:  {color:"#e67e22",label:"Compute"},
  storage:  {color:"#2980b9",label:"Storage"},
  database: {color:"#8e44ad",label:"Database"},
  network:  {color:"#27ae60",label:"Network"},
  security: {color:"#c0392b",label:"Security"},
  messaging:{color:"#16a085",label:"Messaging"},
  monitor:  {color:"#7f8c8d",label:"Monitor"},
};

export const CONCEPTS: Record<string, any> = {
  ec2: {
    title: "Amazon EC2",
    subtitle: "Elastic Compute Cloud",
    easy: "☁️ EC2는 인터넷에 있는 내 컴퓨터야! 집에 있는 PC처럼 켜고 끌 수 있는데 AWS 데이터센터에 있어. 필요할 때만 빌려 쓰고 돈을 내는 구조야. 항상 쓸 거면 미리 예약하면 최대 72% 싸게 쓸 수 있어.",
    points: [
      { label: "인스턴스 구매 옵션", text: "On-Demand(유연), Reserved(1~3년 약정 최대 72% 절감), Spot(최대 90% 절감, 언제든 종료 가능), Dedicated Host(물리 서버 전용)", easy: "🚗 렌터카랑 똑같아! On-Demand는 당일 빌리기(비쌈), Reserved는 1년 장기 계약(싸짐), Spot은 빈 차 초특가인데 언제든 뺏길 수 있어." },
      { label: "AMI", text: "Amazon Machine Image. 인스턴스 OS·소프트웨어 템플릿. 커스텀 AMI로 빠른 배포 가능. 리전간 복사 가능", easy: "🍪 쿠키 틀이야! 틀(AMI) 하나 만들어두면 같은 모양 쿠키(서버)를 몇 개든 빠르게 찍어낼 수 있어." },
    ],
  },
  lambda: {
    title: "AWS Lambda",
    subtitle: "서버리스 함수 실행",
    easy: "🪄 Lambda는 심부름꾼이야! '파일 올렸어'라고 말하면 자동으로 달려와서 일을 처리하고 사라져. 항상 켜놓을 필요가 없어서 비용이 거의 안 들어!",
    points: [
      { label: "실행 제한", text: "최대 실행시간 15분, 메모리 128MB~10GB, /tmp 저장소 512MB~10GB, 동시 실행 기본 1000개", easy: "⏱️ Lambda는 단거리 달리기 선수야. 15분 안에 끝내야 해. 오래 걸리는 마라톤(긴 작업)은 ECS에 넘겨야 해." },
    ],
  },
  s3: {
    title: "Amazon S3",
    subtitle: "Simple Storage Service",
    easy: "🪣 S3는 인터넷 거대 창고야! 사진, 영상, 파일 뭐든 넣을 수 있고 용량이 무한대야. 자주 꺼내는 건 입구 가까이(Standard), 가끔 꺼내는 건 창고 안쪽(Glacier)에 넣으면 보관비가 훨씬 싸!",
    points: [
      { label: "스토리지 클래스", text: "Standard → Standard-IA → One Zone-IA → Glacier Instant → Glacier Flexible → Deep Archive", easy: "🏠 자주 쓰는 건 거실(Standard), 가끔 쓰는 건 창고(IA), 거의 안 쓰는 건 냉동창고(Glacier)." },
    ],
  },
};
