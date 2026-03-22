// SAA-C03 시험 문제 생성을 위한 Few-shot 프롬프트
// Examtopics 수준의 현실감 높은 문제 생성

export const SAA_PROBLEM_PROMPT = `당신은 AWS SAA-C03 시험 출제 전문가입니다.
다음 4가지 예시 문제의 스타일, 난이도, 함정답 구조를 정확히 분석하고,
새로운 문제를 **동일한 수준**으로 만들어주세요.

## 예시 1 (Q76) - 온프레미스 데이터 전송

**시나리오**: 회사는 단일 공장에 있는 여러 기계에서 매일 10TB의 계측 데이터를 수신합니다. 데이터는 공장 내 온프레미스 데이터 센터의 SAN(Storage Area Network)에 저장된 JSON 파일로 구성됩니다. 회사는 이 데이터를 Amazon S3로 전송하여 실시간에 가까운 분석을 제공하는 여러 시스템에서 액세스할 수 있기를 원합니다. **데이터가 민감한 것으로 간주되기 때문에 안전한 전송이 중요합니다.**

**제약조건**: 보안성 높은 데이터 전송, 신뢰성

**문제**: 가장 안정적인 데이터 전송을 제공하는 솔루션은 무엇입니까?

A. AWS DataSync를 공용 인터넷을 통해 사용합니다. 데이터 전송을 위해 암호화를 활성화합니다.
B. AWS Direct Connect를 통한 AWS DataSync를 사용합니다. DataSync에는 자동 암호화 및 데이터 무결성 검증이 포함되어 있습니다.
C. AWS Database Migration Service(AWS DMS)를 공용 인터넷을 통해 사용합니다. SSL/TLS를 통해 데이터를 암호화합니다.
D. AWS Direct Connect를 통해 AWS Database Migration Service(AWS DMS)를 사용합니다. 데이터 전송을 위해 암호화를 활성화합니다.

**정답**: B

**핵심 설명**:
- **아키텍처**: 온프레미스 SAN → DataSync(또는 DMS) → AWS 스토리지 경로
- **DataSync 특징**: 온프레미스 ↔ AWS 스토리지 간 안전한 데이터 이동 자동화, 암호화 + 무결성 검증 내장
- **DMS 특징**: 데이터베이스 마이그레이션 서비스 (JSON 파일 전송에는 부적합) → C, D 오답
- **공용 인터넷 vs Direct Connect**: 공용 인터넷은 민감한 데이터 노출 위험 → A 오답, Direct Connect는 전용 네트워크 연결
- **함정답 분석**:
  * A: 보안 미충족 (공용 인터넷 사용)
  * C: 서비스 선택 오류 (DMS는 파일 전송 부적합)
  * D: 서비스 선택 오류 + 아키텍처 불일치

## 예시 2 (Q77) - 실시간 데이터 수집 (운영 오버헤드 최소화)

**시나리오**: 회사는 애플리케이션에 대한 실시간 데이터 수집 아키텍처를 구성해야 합니다. 여러 소스에서 초당 수천 개의 이벤트가 발생합니다. 회사는 데이터가 스트리밍될 때 변환하는 프로세스와 데이터를 위한 스토리지 솔루션이 필요합니다. 대부분의 팀이 기존 기술에만 익숙하므로 **최소한의 운영 오버헤드**가 중요합니다.

**제약조건**: 실시간 스트리밍 처리, 최소 운영 오버헤드, 데이터 변환 + 자동 저장

**문제**: 솔루션 아키텍트의 추천은 무엇입니까?

A. Amazon EC2 인스턴스를 배포하여 Amazon Kinesis Data Streams로 데이터를 전송하는 API를 호스팅합니다. Kinesis Data Streams를 Kinesis Data Firehose와 연결합니다. AWS Lambda 함수를 사용하여 데이터를 변환합니다. Firehose에서 Amazon S3로 자동 전달합니다.
B. Amazon EC2 인스턴스를 배포하여 API를 호스팅하고 AWS Glue로 데이터를 전송합니다. EC2에서 직접 변환 작업을 수행합니다. 변환된 데이터를 Amazon S3로 저장합니다.
C. Amazon API Gateway API를 구성하여 Amazon Kinesis Data Streams로 데이터를 직접 전송합니다. Kinesis Data Streams를 Kinesis Data Firehose와 연결합니다. AWS Lambda 함수로 데이터를 변환합니다. Firehose에서 데이터를 Amazon S3로 자동으로 전달합니다.
D. Amazon API Gateway API를 구성하여 데이터를 AWS Glue로 보냅니다. AWS Lambda 함수로 데이터를 변환합니다. AWS Glue에서 Amazon S3로 보냅니다.

**정답**: C

**핵심 설명**:
- **아키텍처**: 여러 소스 → API → Kinesis Streams → Firehose → S3 (with Lambda 변환)
- **API Gateway 특징**: 완전관리형 API 서비스, 서버 관리 불필요 (운영 오버헤드 최소)
- **Kinesis Data Streams**: 실시간 스트리밍 데이터 수집, 초당 수천 이벤트 처리 가능
- **Kinesis Data Firehose**: 스트림 → S3 자동 전달, Lambda 변환 지원, 배치 처리 자동화
- **Lambda**: 서버리스 변환 (자동 스케일링)
- **AWS Glue 특징**: ETL 배치 처리 서비스 (실시간 스트리밍에 부적합, 지연 발생) → D 오답
- **함정답 분석**:
  * A: EC2 관리 필요 (운영 오버헤드 증가)
  * B: EC2 관리 + Glue 부적합 (배치 처리, 실시간 부적합)
  * D: Glue의 특성 오류 (실시간 스트리밍에 부적합)

## 예시 3 (Q78) - DynamoDB 7년 보관 (운영 효율성)

**시나리오**: 회사는 사용자 트랜잭션 데이터를 Amazon DynamoDB 테이블에 저장해야 합니다. 규제 준수 요구사항으로 인해 데이터를 **7년 동안 보관**해야 합니다. 데이터는 처음 3개월 동안만 자주 액세스되고 그 이후는 거의 액세스되지 않습니다.

**제약조건**: 7년 보관 (규제 준수), 비용 최적화, 중앙 집중식 관리

**문제**: **가장 운영 효율성이 높은 솔루션**은 무엇입니까?

A. DynamoDB Point-in-Time Recovery(PITR)를 활성화합니다. 최근 35일의 백업을 유지하고 정기적으로 점검합니다.
B. AWS Backup을 사용하여 DynamoDB 테이블에 대한 백업 일정을 생성합니다. 보존 정책을 7년으로 설정합니다. 보관용 백업을 콜드 스토리지로 전환하여 비용을 절감합니다.
C. DynamoDB 콘솔에서 주문형 백업을 생성합니다. 백업을 Amazon S3 버킷으로 내보냅니다. S3 버킷에 수명 주기 정책을 설정합니다.
D. AWS Lambda 함수를 호출하는 Amazon EventBridge 규칙을 생성합니다. 정기적으로 테이블을 백업하고 Amazon S3로 저장합니다. S3 수명 주기 정책을 설정합니다.

**정답**: B

**핵심 설명**:
- **아키텍처**: DynamoDB → AWS Backup (중앙 관리) → 콜드 스토리지 (7년 보관)
- **PITR 특징**: 최근 35일만 복구 가능 (7년 보관 불가능) → A는 시간 제약 미충족
- **AWS Backup 특징**: 중앙 집중식 백업 관리, 자동 생명주기 정책, 콜드 스토리지 자동 전환 (비용 최적화)
- **S3 내보내기 특징**: 가능하지만 수동 관리 필요 (정기 백업 수동 실행, 보관 정책 수동 설정) → C는 운영 효율성 낮음
- **Lambda + EventBridge**: 백업은 가능하지만 상태 모니터링, 에러 처리, 보관 정책 관리 복잡 → D는 불필요한 운영 복잡성
- **함정답 분석**:
  * A: 시간 제약 (35일만 복구 가능)
  * C: 가능하지만 수동 관리 필요 (운영 효율성 낮음)
  * D: 자동화 가능하지만 관리 복잡성 높음

## 예시 4 (Q79) - DynamoDB 예측 불가능 트래픽 (비용 최적화)

**시나리오**: 회사가 Amazon DynamoDB를 사용하여 고객 주문 데이터를 저장할 계획입니다. 사용 패턴이 매우 불규칙합니다. 대부분의 아침에는 읽기/쓰기 작업이 거의 없지만, 저녁에는 예측 불가능한 트래픽이 발생합니다. 트래픽이 급증할 때는 매우 빠르게 증가합니다. IT 예산이 제한적이므로 **비용 최적화**가 중요합니다.

**제약조건**: 예측 불가능한 트래픽 처리, 즉시 스케일링, 비용 최적화

**문제**: 솔루션 아키텍트는 어떤 방식을 권장해야 합니까?

A. DynamoDB 온디맨드 용량 모드에서 테이블을 생성합니다. DynamoDB가 수요에 따라 자동으로 용량을 조정합니다.
B. 글로벌 보조 인덱스(Global Secondary Index, GSI)를 포함하여 DynamoDB 테이블을 생성합니다. 쿼리 성능을 향상시킵니다.
C. 프로비저닝된 용량 모드에서 테이블을 생성합니다. Auto Scaling을 구성하여 트래픽에 따라 용량을 자동 조정합니다.
D. 프로비저닝된 용량 모드에서 테이블을 생성하고 Global Table로 구성합니다. 여러 리전에 걸쳐 가용성을 높입니다.

**정답**: A

**핵심 설명**:
- **아키텍처**: 불규칙한 트래픽 → 온디맨드 모드 (자동 스케일링, 사용량만 청구)
- **온디맨드 모드 특징**: 트래픽 예측 불가능 상황에서 최적, 즉시 대응, 사용량만 청구 (비용 효율)
- **프로비저닝 + Auto Scaling 특징**: 스케일링에 지연 발생 (급격한 트래픽 급증 대응 어려움), 아침 저사용 시간에도 기본 용량 비용 부과 → C는 비용 최적화 미흡
- **GSI 특징**: 쿼리 성능 개선 (요구사항인 비용 최적화와 무관) → B는 요구사항 불일치
- **Global Table 특징**: 여러 리전 고가용성 제공 (요구사항 없음), 추가 비용 증가 → D는 불필요한 복잡성 + 비용 증가
- **함정답 분석**:
  * B: 기능은 좋지만 비용 최적화 요구사항과 무관
  * C: 비용 최적화 미흡 (최소 용량 비용 + 스케일링 지연)
  * D: 불필요한 고가용성 추가 (추가 비용, 요구사항 불일치)

---

## 이제 새로운 문제를 생성해주세요.

**새로운 문제의 조건:**

### 1. 시나리오 (매우 상세함)
- 실제 기업 상황 반영 + 구체적 수치 (예: "월 100TB", "초당 5000 요청", "6개월 보관")
- 아키텍처/프로세스 흐름을 명확히 설명할 수 있는 내용
- 비즈니스 맥락 포함 (규제, 예산, 팀 경험 부족 등)

### 2. 제약 조건 (2~3개 복합 조건)
- 기술적 제약: 성능, 보안, 가용성
- 비즈니스 제약: 비용, 운영 오버헤드
- 각 제약을 명시하기

### 3. 선택지 A~D
- 각 선택지 3~4줄 (구체적 AWS 서비스 설정 명시)
- 1개 정답: 모든 조건 완벽 충족
- 3개 함정답: 거의 맞지만 1가지 조건만 미충족하는 구조

### 4. 정답 및 상세 설명 (사용자 제시 예시처럼 상세함)
- **아키텍처**: 전체 데이터/요청 흐름 설명 (예: "온프레미스 → Direct Connect → AWS → S3")
- **정답 이유**: 모든 제약이 어떻게 만족되는지 + AWS 서비스별 특징
- **함정답 분석**: 각 선택지가 어느 조건을 놓쳤는지 명시
- **서비스 비교**: 왜 다른 서비스는 안 되는지 설명

**주어진 서비스:** \${SERVICE_NAMES}
**난이도:** \${DIFFICULTY}

JSON 형식으로 응답해주세요 (마크다운 코드 블록 없이 순수 JSON):
{
  "question": "시나리오... (2-4문장, 상세한 상황 설명)",
  "constraint": ["제약1", "제약2", "제약3"],
  "options": {
    "A": "선택지 A (3-4줄, 구체적 AWS 설정)",
    "B": "선택지 B (3-4줄, 구체적 AWS 설정)",
    "C": "선택지 C (3-4줄, 구체적 AWS 설정)",
    "D": "선택지 D (3-4줄, 구체적 AWS 설정)"
  },
  "answer": "B",
  "explanation": {
    "architecture": "전체 아키텍처 흐름 설명 (예: 데이터가 어디서 어디로 가는가)",
    "correct": "정답인 이유 + 모든 제약이 어떻게 만족되는가",
    "service_features": "정답에 사용된 AWS 서비스들의 핵심 특징",
    "trap_A": "함정답 A - 어느 제약을 미충족하는가 + 그 이유",
    "trap_B": "함정답 B - 어느 제약을 미충족하는가 + 그 이유",
    "trap_C": "함정답 C - 어느 제약을 미충족하는가 + 그 이유"
  },
  "patterns": ["핵심 패턴 1", "핵심 패턴 2", "핵심 패턴 3"]
}`;

export const SAA_PROBLEM_PROMPT_EN = `You are an AWS SAA-C03 exam expert.
Analyze the style, difficulty level, and trick answer structure of the following 4 example questions,
and create a new problem at **the same level**.

## Example 1 (Q76) - On-premises Data Transfer
Scenario: A company receives 10TB of measurement data daily from multiple machines in a single factory. The data is stored as JSON files in a SAN (Storage Area Network) in an on-premises data center. The company wants to transfer this data to Amazon S3 for real-time analysis by multiple systems. **Secure transmission is critical because the data is considered sensitive.**

What is the most reliable data transfer solution?

A. Use AWS DataSync over public internet. Enable encryption for data transfer.
B. Use AWS DataSync over AWS Direct Connect. DataSync includes automatic encryption and data integrity validation.
C. Use AWS Database Migration Service (AWS DMS) over public internet. Encrypt data via SSL/TLS.
D. Use AWS Database Migration Service (AWS DMS) over AWS Direct Connect. Enable encryption for data transfer.

Answer: B
Key Points:
- DataSync: Automates secure data movement between on-premises and AWS storage services
- DMS: Database migration service (not suitable for file transfer) → C, D incorrect
- Public Internet: Security risk for sensitive data → A incorrect
- Direct Connect: Dedicated network connection (enhanced security)
- Trick answers: A/C lack security with public internet, D uses wrong service entirely

## Example 2 (Q77) - Real-time Data Collection (Minimize Operational Overhead)
Scenario: A company must configure a real-time data collection architecture for an application. Thousands of events occur per second from multiple sources. The company needs a process that transforms data as it streams and a storage solution. **Minimal operational overhead is critical** because most teams are familiar only with legacy technology.

What is the solutions architect's recommendation?

A. Deploy Amazon EC2 instances to host an API that sends data to Amazon Kinesis Data Streams. Connect Kinesis Data Streams to Kinesis Data Firehose. Use AWS Lambda functions to transform data. Firehose automatically delivers to Amazon S3.
B. Deploy Amazon EC2 instances to host an API and send data to AWS Glue. Perform transformation directly on EC2. Store transformed data in Amazon S3.
C. Configure an Amazon API Gateway API to send data directly to Amazon Kinesis Data Streams. Connect Kinesis Data Streams to Kinesis Data Firehose. Use AWS Lambda functions to transform data. Firehose automatically delivers data to Amazon S3.
D. Configure an Amazon API Gateway API to send data to AWS Glue. Use AWS Lambda functions to transform data. Send data from AWS Glue to Amazon S3.

Answer: C
Key Points:
- API Gateway: Fully managed API service (no EC2 management needed) → A, B increase operational overhead
- Kinesis Data Streams: Real-time streaming data ingestion
- Kinesis Data Firehose: Automatic stream to S3 delivery with transformation capability
- Lambda: Serverless transformation
- Glue: Batch ETL service (not suitable for real-time streaming) → D incorrect
- Trick answers: A (EC2 overhead), B (EC2 + Glue unsuitable), D (Glue not for real-time streaming)

## Example 3 (Q78) - DynamoDB 7-Year Retention (Operational Efficiency)
Scenario: A company must store user transaction data in Amazon DynamoDB. Due to regulatory compliance requirements, data must be **retained for 7 years**. Data is accessed frequently only in the first 3 months; afterward, it is rarely accessed.

What is the **most operationally efficient** solution?

A. Enable DynamoDB Point-in-Time Recovery (PITR). Maintain backups for the last 35 days and review them regularly.
B. Use AWS Backup to create a backup schedule for the DynamoDB table. Set retention policy to 7 years. Transition archived backups to cold storage to reduce costs.
C. Create on-demand backups from the DynamoDB console. Export backups to an Amazon S3 bucket. Set S3 bucket lifecycle policies.
D. Create an Amazon EventBridge rule to invoke an AWS Lambda function. Regularly backup the table and store it in Amazon S3. Set S3 lifecycle policies.

Answer: B
Key Points:
- PITR: Only recovers last 35 days (7 years impossible) → A incorrect
- AWS Backup: Centralized backup management, automatic cold storage transition, lifecycle management → highest operational efficiency
- S3 Export: Possible but requires manual management → C more complex than B
- Lambda + EventBridge: Works but high management overhead → D unnecessarily complex
- Trick answers: A (time limitation), C (manual management), D (unnecessary complexity)

## Example 4 (Q79) - DynamoDB Unpredictable Traffic (Cost Optimization)
Scenario: A company plans to use Amazon DynamoDB to store customer order data. Usage patterns are highly irregular. Most mornings have few read/write operations, but evenings experience unpredictable traffic spikes that occur very rapidly. Due to limited IT budget, **cost optimization is critical**.

What billing mode should the solutions architect recommend?

A. Create the table in DynamoDB on-demand capacity mode. DynamoDB automatically adjusts capacity based on demand.
B. Create the DynamoDB table with a Global Secondary Index (GSI). GSI improves query performance.
C. Create the table in DynamoDB provisioned capacity mode. Configure Auto Scaling to automatically adjust capacity based on traffic.
D. Create the table in provisioned capacity mode and configure as a Global Table across multiple regions. Increase availability across regions.

Answer: A
Key Points:
- On-demand mode: Optimal for unpredictable traffic, billing only for usage (cost efficient)
- Provisioned + Auto Scaling: Scaling delay, pays for unused capacity → C cannot handle sudden spikes
- GSI: Improves query performance (not cost optimization) → B doesn't address requirement
- Global Table: High availability not needed, adds cost → D unnecessary complexity
- Trick answers: B (good feature but doesn't match requirement), C (cost optimization insufficient), D (unnecessary high availability)

---

## Now generate a new problem.

**New Problem Conditions:**
1. Scenario: Real business situation with specific metrics (e.g., "100TB monthly data", "5000 requests/sec", "6-month retention")
2. Constraints: 2-3 combined requirements (e.g., "cost optimization + minimal operational overhead", "high availability + low latency")
3. Options A-D:
   - Each option 3-4 lines (include specific AWS service configurations)
   - 1 correct answer: meets all constraints
   - 3 trick answers: almost correct but missing 1 constraint
4. Answer and detailed explanation:
   - Why the correct answer meets all constraints
   - Which constraint each trick answer fails to meet
   - AWS documentation-based explanation

**Given services:** \${SERVICE_NAMES}
**Difficulty:** \${DIFFICULTY}

Respond in JSON format:
{
  "question": "Scenario... (2-4 sentences)",
  "constraint": ["constraint1", "constraint2", "constraint3"],
  "options": {
    "A": "Option A (3-4 lines)",
    "B": "Option B (3-4 lines)",
    "C": "Option C (3-4 lines)",
    "D": "Option D (3-4 lines)"
  },
  "answer": "B",
  "explanation": {
    "correct": "Why answer is correct + AWS service characteristics",
    "trap_A": "Trap answer A - which constraint is not met",
    "trap_C": "Trap answer C - which constraint is not met",
    "trap_D": "Trap answer D - which constraint is not met"
  },
  "patterns": ["Key pattern of this problem 1", "Key pattern 2"]
}`;

export const SAA_PROBLEM_PROMPT_JA = `あなたはAWS SAA-C03試験の専門家です。
以下の4つの例題のスタイル、難易度レベル、トリック選択肢の構造を分析し、
**同じレベルで**新しい問題を作成してください。

## 例1 (Q76) - オンプレミスデータ転送
シナリオ: 会社は単一工場の複数の機械から毎日10TBの測定データを受信します。データはオンプレミスデータセンターのSAN(Storage Area Network)にJSON ファイルとして保存されています。会社はこのデータをAmazon S3に転送して、複数のシステムによるリアルタイム分析に利用できるようにしたいと考えています。**データは機密であるため、安全な転送が重要です。**

最も信頼性の高いデータ転送ソリューションは何ですか?

A. パブリックインターネット経由でAWS DataSyncを使用します。データ転送の暗号化を有効にします。
B. AWS Direct Connect経由でAWS DataSyncを使用します。DataSyncは自動暗号化とデータ整合性検証を含みます。
C. パブリックインターネット経由でAWS Database Migration Service(AWS DMS)を使用します。SSL/TLSを介してデータを暗号化します。
D. AWS Direct Connect経由でAWS Database Migration Service(AWS DMS)を使用します。データ転送の暗号化を有効にします。

答え: B
重要なポイント:
- DataSync: オンプレミスとAWSストレージサービス間の安全なデータ移動を自動化
- DMS: データベース移行サービス(ファイル転送に不適切) → C、D不正解
- パブリックインターネット: 機密データのセキュリティリスク → A不正解
- Direct Connect: 専用ネットワーク接続(セキュリティ強化)
- トリック選択肢: A/Cはパブリックインターネットでセキュリティ不足、Dは完全に異なるサービス

## 例2 (Q77) - リアルタイムデータ収集(運用オーバーヘッドの最小化)
シナリオ: 会社はアプリケーション用のリアルタイムデータ収集アーキテクチャを構成する必要があります。複数のソースから毎秒数千のイベントが発生します。会社はデータを流れるときに変換するプロセスとストレージソリューションが必要です。**運用オーバーヘッドの最小化が重要です**。ほとんどのチームはレガシー技術にのみ精通しています。

ソリューションアーキテクトの推奨事項は何ですか?

A. Amazon EC2インスタンスをデプロイしてAmazon Kinesis Data Streamsにデータを送信するAPIをホストします。Kinesis Data StreamsをKinesis Data Firehoseに接続します。AWS Lambda関数を使用してデータを変換します。FirehoseはAmazon S3に自動配信します。
B. Amazon EC2インスタンスをデプロイしてAPIをホストし、AWS Glueにデータを送信します。EC2で直接変換作業を実行します。変換されたデータをAmazon S3に保存します。
C. Amazon API Gateway APIを構成して、Amazon Kinesis Data Streamsに直接データを送信します。Kinesis Data StreamsをKinesis Data Firehoseに接続します。AWS Lambda関数を使用してデータを変換します。Firehoseはデータを自動的にAmazon S3に配信します。
D. Amazon API Gateway APIを構成してAWS Glueにデータを送信します。AWS Lambda関数を使用してデータを変換します。AWS GlueからAmazon S3に送信します。

答え: C
重要なポイント:
- API Gateway: フルマネージドAPIサービス(EC2管理不要) → A、Bは運用オーバーヘッド増加
- Kinesis Data Streams: リアルタイムストリーミングデータの取り込み
- Kinesis Data Firehose: ストリームからS3への自動配信、変換可能
- Lambda: サーバーレス変換
- Glue: バッチETLサービス(リアルタイムストリーミング不適切) → D不正解
- トリック選択肢: A(EC2オーバーヘッド)、B(EC2 + Glue不適切)、D(Glueはリアルタイムストリーミングに不適切)

## 例3 (Q78) - DynamoDB 7年保持(運用効率)
シナリオ: 会社はユーザートランザクションデータをAmazon DynamoDBテーブルに保存する必要があります。規制遵守要件のため、データを**7年間保持する**必要があります。データは最初の3か月間だけ頻繁にアクセスされ、その後はほとんどアクセスされません。

**最も運用効率の高いソリューションは何ですか?**

A. DynamoDB Point-in-Time Recovery(PITR)を有効にします。最後の35日間のバックアップを保持し、定期的に確認します。
B. AWS Backupを使用してDynamoDBテーブルのバックアップスケジュールを作成します。保持期間を7年に設定します。アーカイブされたバックアップをコールドストレージに移行してコストを削減します。
C. DynamoDBコンソールからオンデマンドバックアップを作成します。バックアップをAmazon S3バケットにエクスポートします。S3バケットのライフサイクルポリシーを設定します。
D. Amazon EventBridgeルールを作成してAWS Lambda関数を呼び出します。定期的にテーブルをバックアップしてAmazon S3に保存します。S3ライフサイクルポリシーを設定します。

答え: B
重要なポイント:
- PITR: 最後の35日間のみ復旧可能(7年不可能) → A不正解
- AWS Backup: 集中管理されたバックアップ、自動コールドストレージ移行、ライフサイクル管理 → 最高の運用効率
- S3エクスポート: 可能ですが手動管理が必要 → Cはより複雑
- Lambda + EventBridge: 機能しますが管理オーバーヘッドが高い → D不必要に複雑
- トリック選択肢: A(時間制限)、C(手動管理)、D(不必要な複雑さ)

## 例4 (Q79) - DynamoDB予測不可能なトラフィック(コスト最適化)
シナリオ: 会社はAmazon DynamoDBを使用してカスタマーオーダーデータを保存する予定です。使用パターンは非常に不規則です。ほとんどの朝は読み取り/書き込み操作がほぼありませんが、夕方には予測不可能なトラフィックスパイクが発生します。スパイクは非常に急速に増加します。IT予算が制限されているため、**コスト最適化が重要です。**

ソリューションアーキテクトはどの課金モードを推奨すべきですか?

A. DynamoDBオンデマンド容量モードでテーブルを作成します。DynamoDBは需要に応じて容量を自動的に調整します。
B. Global Secondary Index(GSI)を含むDynamoDBテーブルを作成します。GSIはクエリパフォーマンスを向上させます。
C. プロビジョニング容量モードでテーブルを作成します。トラフィックに応じて容量を自動調整するようオートスケーリングを構成します。
D. プロビジョニング容量モードでテーブルを作成し、複数リージョンにグローバルテーブルとして構成します。リージョン間の可用性を向上させます。

答え: A
重要なポイント:
- オンデマンドモード: 予測不可能なトラフィックに最適、使用量のみ請求(コスト効率的)
- プロビジョニング + オートスケーリング: スケーリング遅延、未使用容量も請求 → Cは急スパイクに対応できない
- GSI: クエリパフォーマンス向上(コスト最適化ではない) → Bは要件と一致しない
- Global Table: 高可用性不要、追加コスト → D不必要な複雑さ
- トリック選択肢: B(良い機能だが要件不一致)、C(コスト最適化不十分)、D(不必要な高可用性)

---

## 新しい問題を生成してください。

**新しい問題の条件:**
1. シナリオ: 実際のビジネス状況に反映、具体的な数値を含む(例えば「月100TBデータ」「毎秒5000リクエスト」「6ヶ月保持」)
2. 制約条件: 2~3の複合要件(例えば「コスト最適化+最小運用オーバーヘッド」「高可用性+低遅延」)
3. 選択肢A~D:
   - 各選択肢3~4行(具体的なAWSサービス設定を含む)
   - 1つの正解: すべての制約を満たす
   - 3つのトリック選択肢: ほぼ正しいが1つの制約を満たさない
4. 答えと詳細説明:
   - なぜ正解がすべての制約を満たすのか
   - 各トリック選択肢がどの制約を満たさないか明示
   - AWSドキュメント基づきの説明

**与えられたサービス:** \${SERVICE_NAMES}
**難易度:** \${DIFFICULTY}

JSON形式で応答してください:
{
  "question": "シナリオ... (2~4文)",
  "constraint": ["制約1", "制約2", "制約3"],
  "options": {
    "A": "選択肢 A (3~4行)",
    "B": "選択肢 B (3~4行)",
    "C": "選択肢 C (3~4行)",
    "D": "選択肢 D (3~4行)"
  },
  "answer": "B",
  "explanation": {
    "correct": "正解の理由 + AWSサービスの特徴",
    "trap_A": "トリック選択肢 A - どの制約を満たさないか",
    "trap_C": "トリック選択肢 C - どの制約を満たさないか",
    "trap_D": "トリック選択肢 D - どの制約を満たさないか"
  },
  "patterns": ["この問題の重要なパターン 1", "重要なパターン 2"]
}`;

export const DIFFICULTY_LABELS = {
  ko: { easy: "쉬움", medium: "보통", hard: "어려움" },
  ja: { easy: "簡単", medium: "普通", hard: "難しい" },
  en: { easy: "Easy", medium: "Medium", hard: "Hard" },
} as const;

export function generatePrompt(
  serviceNames: string[],
  difficulty: string,
  locale: "ko" | "ja" | "en" = "ko"
): string {
  const prompts = { ko: SAA_PROBLEM_PROMPT, ja: SAA_PROBLEM_PROMPT_JA, en: SAA_PROBLEM_PROMPT_EN };
  const prompt = prompts[locale];
  const diffLabel = DIFFICULTY_LABELS[locale][difficulty as "easy" | "medium" | "hard"] || difficulty;
  return prompt
    .replace("${SERVICE_NAMES}", serviceNames.join(", "))
    .replace("${DIFFICULTY}", diffLabel);
}
