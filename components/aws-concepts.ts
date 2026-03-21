export const CONCEPTS = {
  ec2: {
    title: "Amazon EC2",
    subtitle: "Elastic Compute Cloud",
    easy: "☁️ EC2는 인터넷에 있는 내 컴퓨터야! 집에 있는 PC처럼 켜고 끌 수 있는데 AWS 데이터센터에 있어. 필요할 때만 빌려 쓰고 돈을 내는 구조야. 항상 쓸 거면 미리 예약하면 최대 72% 싸게 쓸 수 있어.",
    points: [
      {
        label: "인스턴스 구매 옵션",
        text: "On-Demand(유연), Reserved(1~3년 약정 최대 72% 절감), Spot(최대 90% 절감, 언제든 종료 가능), Dedicated Host(물리 서버 전용)",
        easy: "🚗 렌터카랑 똑같아! On-Demand는 당일 빌리기(비쌈), Reserved는 1년 장기 계약(싸짐), Spot은 빈 차 초특가인데 언제든 뺏길 수 있어.",
      },
    ],
  },
  lambda: {
    title: "AWS Lambda",
    subtitle: "서버리스 함수 실행",
    easy: "🪄 Lambda는 심부름꾼이야! '파일 올렸어'라고 말하면 자동으로 달려와서 일을 처리하고 사라져. 항상 켜놓을 필요가 없어서 비용이 거의 안 들어!",
    points: [
      {
        label: "실행 제한",
        text: "최대 실행시간 15분, 메모리 128MB~10GB, /tmp 저장소 512MB~10GB, 동시 실행 기본 1000개",
        easy: "⏱️ Lambda는 단거리 달리기 선수야. 15분 안에 끝내야 해. 오래 걸리는 마라톤(긴 작업)은 ECS에 넘겨야 해.",
      },
    ],
  },
  s3: {
    title: "Amazon S3",
    subtitle: "Simple Storage Service",
    easy: "🪣 S3는 인터넷 거대 창고야! 사진, 영상, 파일 뭐든 넣을 수 있고 용량이 무한대야. 자주 꺼내는 건 입구 가까이(Standard), 가끔 꺼내는 건 창고 안쪽(Glacier)에 넣으면 보관비가 훨씬 싸!",
    points: [
      {
        label: "스토리지 클래스",
        text: "Standard → Standard-IA → One Zone-IA → Glacier Instant → Glacier Flexible → Deep Archive (비용 순)",
        easy: "🏠 집 정리랑 같아! 자주 쓰는 건 거실(Standard), 가끔 쓰는 건 창고(IA), 거의 안 쓰는 건 지하 냉동창고(Glacier). 멀수록 꺼내기 불편하지만 보관비가 싸.",
      },
    ],
  },
  rds: {
    title: "Amazon RDS",
    subtitle: "Relational Database Service",
    easy: "📒 RDS는 엑셀처럼 줄·칸으로 정리된 데이터 창고야. AWS가 대신 관리해줘서 백업도 자동이야. Multi-AZ는 같은 내용을 다른 창고에도 저장해두는 것, Read Replica는 읽기 전용 복사본을 여러 개 만드는 거야!",
    points: [
      {
        label: "Multi-AZ",
        text: "동기 복제(Standby). 장애 시 자동 페일오버 60~120초. 읽기 불가(standby는 대기용). DNS 레코드가 바뀜",
        easy: "🏥 응급 대기 병원이야! 주 병원이 갑자기 닫히면 1~2분 안에 백업 병원이 자동으로 열려. 백업 병원은 평소엔 대기만 해.",
      },
    ],
  },
  vpc: {
    title: "Amazon VPC",
    subtitle: "Virtual Private Cloud",
    easy: "🏘️ VPC는 AWS 안에 울타리 쳐진 내 동네야! Public Subnet은 인터넷에서 접근 가능, Private Subnet은 내부에서만 접근해. Security Group은 집마다 있는 현관 잠금장치, NACL은 동네 입구 경비원이야!",
    points: [
      {
        label: "구성 요소",
        text: "Subnet(Public/Private), Route Table, IGW(인터넷 게이트웨이), NAT Gateway(Private→인터넷 단방향), VPC Peering",
        easy: "🗺️ 동네 지도야! 공개 구역(Public Subnet)은 외부인 출입 가능, 비공개 구역(Private)은 주민만 출입. IGW는 동네 정문, NAT는 주민이 밖에 나갈 수 있는 쪽문.",
      },
    ],
  },
  dynamodb: {
    title: "Amazon DynamoDB",
    subtitle: "서버리스 NoSQL 데이터베이스",
    easy: "⚡ DynamoDB는 서랍장 같은 창고야! 각 서랍(아이템)에 뭐든 자유롭게 넣을 수 있고 1초에 수백만 번 꺼내고 넣을 수 있어!",
    points: [
      {
        label: "용량 모드",
        text: "On-Demand: 트래픽 자동 대응, 예측 불가 워크로드. Provisioned: RCU/WCU 직접 설정, 더 저렴, Auto Scaling 가능",
        easy: "🏪 On-Demand는 손님이 몇 명이든 알아서 처리(비쌈), Provisioned는 '오늘 손님 100명 예상'이라고 미리 준비(저렴하지만 넘치면 오류).",
      },
    ],
  },
  cloudwatch: {
    title: "Amazon CloudWatch",
    subtitle: "모니터링 & 관찰 서비스",
    easy: "👁️ CloudWatch는 AWS의 CCTV + 알람 시스템이야! 서버가 얼마나 바쁜지 계속 지켜보다가 이상한 일이 생기면 바로 문자로 알려줘!",
    points: [
      {
        label: "Metrics",
        text: "기본 메트릭(5분 간격, 무료). 세부 모니터링(1분 간격, 유료). 커스텀 메트릭으로 앱 지표 수집 가능",
        easy: "📊 기본 CCTV는 5분마다 사진 찍기(무료), 고화질 CCTV는 1분마다(유료). 커스텀 메트릭은 내가 원하는 걸 직접 측정하는 거야.",
      },
    ],
  },
  sns: {
    title: "Amazon SNS",
    subtitle: "Simple Notification Service",
    easy: "📣 SNS는 방송 시스템이야! 마이크(Topic)에 대고 '급식 시작!'이라고 외치면 학생(구독자) 모두가 동시에 들어. SQS, Lambda, 이메일에 동시에 메시지를 보낼 수 있어!",
    points: [
      {
        label: "개요",
        text: "Pub/Sub 메시징. Publisher → Topic → Subscribers. 구독자: SQS, Lambda, Email, SMS, HTTP, Kinesis Firehose",
        easy: "📻 라디오 방송이야! 방송국(Publisher)이 전파(Topic)에 방송하면 라디오(구독자)들이 동시에 수신해. 구독자를 몇 명이든 추가 가능.",
      },
    ],
  },
  sqs: {
    title: "Amazon SQS",
    subtitle: "Simple Queue Service",
    easy: "📬 SQS는 우체통이야! 편지(메시지)를 넣어두면 배달부(서버)가 나중에 꺼내서 처리해. 배달부가 바빠도 편지는 우체통에 안전하게 보관돼!",
    points: [
      {
        label: "타입",
        text: "Standard: 최소 1회 전달(중복 가능), 순서 미보장, 높은 처리량. FIFO: 정확히 1회, 순서 보장, 초당 300~3000 TPS",
        easy: "📮 Standard는 일반 우편(빠르지만 가끔 편지가 두 번 배달될 수 있어), FIFO는 등기우편(느리지만 정확히 한 번, 순서 보장).",
      },
    ],
  },
};

export type ConceptKey = keyof typeof CONCEPTS;
