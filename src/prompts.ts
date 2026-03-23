// SAA-C03 시험 문제 생성을 위한 Few-shot 프롬프트
// Examtopics 수준의 현실감 높은 문제 생성
// 난이도별로 다른 프롬프트 사용

/**
 * 난이도: 보통 (기본 개념 이해)
 * - 단일 AWS 서비스의 기본 사용 방법
 * - 1개 명백한 함정답 (다른 서비스 선택)
 * - 2개 어느 정도 가능한 선택지
 */
export const SAA_PROBLEM_PROMPT_MEDIUM = `당신은 AWS SAA-C03 시험의 최고 수준 출제 전문가입니다.
다음 6가지 예시 문제의 스타일, 난이도, 함정답 구조를 정확히 분석하고,
새로운 문제를 **동일한 수준**으로 만들어주세요.

## 📋 생성 시 필수 규칙:
1. **options (선택지)**: 매우 중요! 각 선택지는 **3-5줄의 구체적인 서술형**으로 작성
   - 단순하지 말고, 실제 아키텍처처럼 구체적으로 설명
   - 예: "Amazon EC2를 배포하여 Amazon Kinesis 데이터 스트림으로 데이터를 전송하는 API를 호스팅합니다. Kinesis 데이터 스트림을 Firehose의 데이터 원본으로 사용합니다. Lambda로 변환하고 Firehose를 통해 S3로 전달합니다."
2. **goal (핵심 목표)**: 이 문제가 테스트하는 핵심 목표를 한 문장으로 명확히
3. **keywords (핵심 키워드)**: 문제에서 가장 중요한 AWS 개념 3~4개
4. **easyMode 설명**: 초등학교 5학년도 이해하는 비유법 사용
   - 각 선택지를 어린이 수준으로 설명
   - 함정답이 왜 틀렸는지 쉽게 설명
5. **explanation.correct**: 정답이 왜 맞는지 기술적으로 명확하게
6. **explanation.trap_***: 각 함정답이 정확히 어느 부분에서 실패하는지 구체적으로
7. **SAA 시험용 요점**: 시험에서 자주 출제되는 핵심 개념 정리

## 예시 1 (Q73) - 보안 그룹 설정 (Bastion Host + Application)

**시나리오**: 한 회사는 최근 프라이빗 서브넷의 Amazon EC2에서 Linux 기반 애플리케이션 인스턴스를 시작했고, VPC의 퍼블릭 서브넷에 있는 Amazon EC2 인스턴스에서 Linux 기반 배스천 호스트를 시작했습니다. 솔루션 설계자는 **사내 네트워크에서 회사의 인터넷 연결을 통해 배스천 호스트와 애플리케이션 서버 모두에 접속**해야 합니다. 모든 EC2 인스턴스의 보안 그룹이 이러한 액세스를 허용하는지 확인해야 합니다.

**제약조건**:
1. 사내 네트워크 → 배스천 호스트 (퍼블릭 서브넷)로 접속 가능
2. 배스천 호스트 → 애플리케이션 서버 (프라이빗 서브넷)로 SSH 접속 가능
3. 최소 권한 원칙 준수 (불필요한 포트 개방 금지)

**문제**: 솔루션 설계자가 취해야 할 보안 그룹 구성 단계는? (2개 선택)

A. 배스천 호스트의 보안 그룹을 애플리케이션 인스턴스의 인바운드 액세스만 허용하도록 교체합니다.
B. 배스천 호스트의 보안 그룹을 회사의 내부 IP 범위에서만 인바운드 액세스를 허용하도록 교체합니다.
C. 배스천 호스트의 보안 그룹을 회사의 외부 IP 범위(인터넷 외부 IP)에서만 인바운드 액세스를 허용하도록 교체합니다.
D. 애플리케이션 인스턴스의 보안 그룹을 배스천 호스트의 개인 IP 주소에서만 인바운드 SSH 액세스를 허용하도록 교체합니다.
E. 애플리케이션 인스턴스의 보안 그룹을 배스천 호스트의 공용 IP 주소에서만 인바운드 SSH 액세스를 허용하도록 교체합니다.

**정답**: C, D

**핵심 설명**:
- **아키텍처**: 사내네트워크(내부IP) → 인터넷 게이트웨이(외부IP로 변환) → Bastion Host(퍼블릭) → Application(프라이빗, 내부IP 통신)
- **Bastion Host 역할**: 프라이빗 서브넷의 애플리케이션으로 접속하는 유일한 진입점. SSH 터널 역할
- **정답 C (배스천 호스트 보안 그룹)**:
  * 사내에서 인터넷으로 나오는 트래픽은 회사의 외부 IP 범위(External IP)
  * 공용 인터넷을 통해 배스천 호스트에 도달하므로 외부 IP 범위에서의 인바운드 허용 필요
  * 내부 IP 범위(B)는 온프레미스 사내 네트워크의 IP → 인터넷을 거쳐 외부IP가 되므로 오답
- **정답 D (애플리케이션 보안 그룹)**:
  * 배스천 호스트에서 애플리케이션으로 SSH 접속할 때는 배스천의 프라이빗 IP 사용
  * 프라이빗 서브넷 내에서는 배스천의 프라이빗 IP로 통신
  * 공용 IP(E)는 프라이빗 서브넷 내에서 불필요 (라우팅 불가)
- **함정답 분석**:
  * A: "애플리케이션의 인바운드만" → 쌍방향 통신 불가능
  * B: "내부 IP" → 인터넷을 거친 외부 IP가 아님 (NAT 후 외부 IP로 변환됨)
  * E: 공용 IP 사용 → 프라이빗 서브넷에 프라이빗 IP로만 도달 가능
- **Stateful SG 개념**: 보안 그룹은 인바운드 규칙 생성 시 해당 요청에 대한 아웃바운드 자동 허용 (명시적 아웃바운드 규칙 불필요)

## 예시 2 (Q74) - 2계층 웹 애플리케이션 보안 그룹

**시나리오**: 솔루션 설계자는 2계층 웹 애플리케이션을 설계하고 있습니다. 애플리케이션은 퍼블릭 서브넷의 Amazon EC2에서 호스팅되는 퍼블릭 웹 티어로 구성됩니다. 데이터베이스 계층은 프라이빗 서브넷의 Amazon EC2에서 실행되는 Microsoft SQL Server(포트 1433)로 구성됩니다. **보안은 회사의 최우선 과제입니다.**

**제약조건**:
1. 외부 인터넷 사용자 → 웹 티어 (HTTPS 443 포트) 접속 가능
2. 웹 티어 → 데이터베이스 (SQL Server 1433 포트) 접속 가능
3. 최소 권한 원칙 준수 (필요한 포트만 개방)

**문제**: 보안 그룹을 어떻게 구성해야 합니까? (2개 선택)

A. 웹 티어 보안 그룹: 0.0.0.0/0에서 포트 443의 인바운드 트래픽 허용 (HTTPS)
B. 웹 티어 보안 그룹: 0.0.0.0/0으로 포트 443의 아웃바운드 트래픽 허용
C. 데이터베이스 보안 그룹: 웹 티어 보안 그룹에서 포트 1433의 인바운드 트래픽 허용
D. 데이터베이스 보안 그룹: 포트 443 및 1433의 아웃바운드 트래픽을 웹 티어로 허용
E. 데이터베이스 보안 그룹: 웹 티어 보안 그룹의 포트 443 및 1433에서 인바운드 트래픽 허용

**정답**: A, C

**핵심 설명**:
- **아키텍처**: 인터넷 사용자(0.0.0.0/0) → 웹 티어(퍼블릭, 443) → 데이터베이스(프라이빗, 1433)
- **정답 A (웹 티어 인바운드)**:
  * 외부 인터넷의 모든 사용자(0.0.0.0/0)에서 HTTPS 443 포트로의 인바운드 허용 필수
  * 보안 그룹은 인바운드만 명시하면 아웃바운드는 자동으로 응답(Stateful)
- **정답 C (데이터베이스 인바운드)**:
  * 웹 티어 EC2 인스턴스의 보안 그룹을 Source로 지정
  * 포트 1433 (SQL Server) 인바운드만 필요 (웹 티어는 조회용이므로 DB에서 웹으로 주도적 통신 없음)
  * 최소 권한: 필요한 포트만 개방 (HTTP 80, RDP 3389 등 불필요)
- **함정답 분석**:
  * B: 아웃바운드는 기본적으로 허용됨 (명시할 필요 없음) + Stateful SG에서 요청에 대한 응답은 자동으로 허용
  * D: "443 + 1433 아웃바운드" → 데이터베이스에서 웹으로 주도적 통신 불필요 + 포트 443은 DB와 무관
  * E: "443 및 1433에서 인바운드" → 포트 443(HTTPS)은 웹 서버용이지 DB와 무관, 불필요한 포트 개방
- **Stateful vs Stateless**:
  * 보안 그룹(Stateful): 인바운드 규칙만 설정 → 응답 트래픽 자동 허용
  * Network ACL(Stateless): 인바운드 + 아웃바운드 규칙 모두 명시 필요

## 예시 3 (Q76) - 온프레미스 데이터 전송

## 예시 4 (Q77) - 실시간 데이터 수집 (운영 오버헤드 최소화)

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

## 예시 5 (Q78) - DynamoDB 7년 보관 (운영 효율성)

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

## 예시 6 (Q79) - DynamoDB 예측 불가능 트래픽 (비용 최적화)

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

**새로운 문제의 생성 원칙:**

### 1. 시나리오 (2-4문장, 매우 상세함)
- 실제 기업 상황 반영 (예: "제조업체", "금융사", "SaaS 회사")
- 구체적 수치 포함 (예: "월 100TB", "초당 5000 요청", "6개월 보관", "일일 10TB")
- 비즈니스 맥락 명확 (규제, 예산, 팀 경험 부족, 성능 요구사항 등)
- 아키텍처/데이터 흐름이 명확하게 설명되어야 함

### 2. 제약 조건 (2~3개, 명시적)
- 기술적 제약: 성능, 보안, 가용성, 네트워킹 등
- 비즈니스 제약: 비용 최적화, 운영 오버헤드 최소화, 규제 준수 등
- 각 제약을 **명시적으로 마크하기** (정답과 함정답 구분에 중요)

### 3. 선택지 A~D (각 3~4줄)
- 각 선택지는 구체적인 AWS 서비스 이름 + 설정값 포함
- 1개 정답: 모든 제약조건 완벽 충족
- 3개 함정답:
  * 1개: 거의 맞지만 1가지 제약만 미충족 (가장 실수하기 쉬운 오답)
  * 1개: 거의 맞지만 다른 1가지 제약 미충족
  * 1개: 기술적으로 동작하지만 요구사항 불일치

### 4. 정답 및 상세 설명 (Examtopics Q73-Q77 수준)
**architecture**: 전체 데이터/요청 흐름을 명확히 (예: "사내IP → 인터넷 → 외부IP → AWS → 프라이빗 서브넷")
**correct**: 모든 제약조건이 어떻게 만족되는지 + AWS 서비스별 핵심 특징 설명
**service_features**: 정답에 사용된 각 AWS 서비스의 특징 + 한계 설명
**trap_A, B, C**:
  - 각 함정답이 어느 제약조건을 놓쳤는지 명시
  - 그 서비스/옵션의 기술적 특징과 제한사항 설명
  - 왜 그것이 미흡한지에 대한 기술적 근거 제시

### 5. 핵심 패턴 (3개)
- 이 문제에서 테스트하는 핵심 개념
- SAA 시험에서 자주 나오는 함정
- 이 문제로부터 배울 수 있는 AWS 아키텍처 원칙

**주어진 서비스:** \${SERVICE_NAMES}
**난이도:** \${DIFFICULTY}

JSON 형식으로 응답해주세요 (마크다운 없이 순수 JSON, 모든 값은 한 줄):
{
  "question": "구체적 시나리오와 제약조건을 포함한 2-4문장 질문",
  "constraint": ["제약1", "제약2", "제약3"],
  "options": {
    "A": "선택지 A: 구체적으로 어떤 서비스들을 조합하고, 어떻게 데이터 흐름을 만드는지 3-4줄로 상세히 서술 (예: Amazon EC2를 배포하여... Kinesis를 통해... Lambda로... S3로 전달)",
    "B": "선택지 B: 다른 서비스 조합을 사용하는 아키텍처를 3-4줄로 상세히 서술",
    "C": "선택지 C: 다른 서비스 조합을 사용하는 아키텍처를 3-4줄로 상세히 서술",
    "D": "선택지 D: 다른 서비스 조합을 사용하는 아키텍처를 3-4줄로 상세히 서술"
  },
  "answer": "B",
  "keywords": ["핵심 개념1", "핵심 개념2", "핵심 개념3"],
  "goal": "이 문제가 테스트하는 핵심 목표 한 문장 (예: 데이터 삭제 방지의 가장 강력한 보안 방법)",
  "easyMode": {
    "explanation": "정답을 초등학교 5학년 수준으로 설명. 비유법 사용 (예: 타임머신, 이중 잠금). 정답의 핵심 기능 2-3가지 나열하고 각각 어린이 언어로 설명",
    "A": "선택지 A가 어떤 기능인지 어린이 수준으로 설명. 왜 이게 정답/오답인지 쉽게 설명",
    "B": "선택지 B가 어떤 기능인지 어린이 수준으로 설명. 한계점이 있다면 명시",
    "C": "선택지 C가 어떤 기능인지 어린이 수준으로 설명. 왜 부족한지 설명",
    "D": "선택지 D가 어떤 기능인지 어린이 수준으로 설명. 다른 용도라면 언급"
  },
  "explanation": {
    "architecture": "전체 아키텍처 흐름과 각 컴포넌트의 역할",
    "correct": "정답이 왜 모든 제약을 만족하는지 기술적으로 상세히 설명. 핵심 개념 + 작동 원리",
    "service_features": "정답에 포함된 각 AWS 서비스의 핵심 특징과 한계",
    "trap_A": "선택지 A가 정확히 어느 제약을 미충족하는지 + 기술적 이유 + 실제 부작용",
    "trap_B": "선택지 B가 정확히 어느 제약을 미충족하는지 + 기술적 이유 + 실제 부작용",
    "trap_C": "선택지 C가 정확히 어느 제약을 미충족하는지 + 기술적 이유 + 실제 부작용"
  },
  "patterns": ["패턴1: 시험에 자주 출제되는 개념", "패턴2: 유사 서비스와의 차이점", "패턴3: SAA 시험 팁"]
}

⚠️ 필수사항:
1. 모든 값은 반드시 한 줄로 작성 (줄바꿈 금지)
2. 선택지와 easyMode 설명에 구체적 예시나 비유 포함
3. 함정답(trap_*)은 "정책적 한계", "기술적 불가능", "다른 용도" 등으로 분류해서 설명`;

/**
 * 난이도: 어려움 (복합 조건 분석)
 * - 2~3개 AWS 서비스 조합
 * - 2개의 정교한 함정답 (각각 1가지 제약 미충족)
 * - 실무 수준의 아키텍처 이해 필요
 */
export const SAA_PROBLEM_PROMPT_HARD = `당신은 AWS SAA-C03 시험 출제 전문가입니다.
다음은 "어려움" 난이도의 예시 문제입니다. 복합적인 제약조건과 정교한 함정답 구조를 분석하세요.

## 예시: 복합 조건 문제 (어려움)

**특징**:
- 2~3개 AWS 서비스를 조합하여 해결
- 제약조건 2~3개가 서로 연관됨
- 함정답: 거의 맞지만 비용, 성능, 운영 측면 중 하나 미충족
- 실무 시나리오 (구체적 수치 + 비즈니스 맥락)

**시나리오 예**: "월 500GB 데이터, 초당 2000 요청, 99.9% 가용성 요구"
**제약조건**:
1. 성능: 레이턴시 < 100ms
2. 비용: 월 $5,000 이내
3. 가용성: 99.9% (다중 AZ)

**함정답 구조**:
- A: 비용은 맞지만 성능 미흡 (단일 AZ)
- B: 성능 + 가용성 OK 하지만 비용 초과
- C: 모든 조건 만족 ✅
- D: 성능은 최고이지만 비용 2배 + 불필요한 기능

**새로운 문제 조건**:
- 시나리오: 구체적 수치 3~4개 (데이터량, 트래픽, 보관 기간, 비용)
- 제약: 기술 + 비즈니스 + 운영 3가지
- 선택지: 각 3~4줄, 서비스명 + 설정값 명시 + 구체적 아키텍처 서술
- 정답: 모든 제약 완벽 충족
- 함정: 각각 다른 1개 제약 미충족

**주어진 서비스:** \${SERVICE_NAMES}
**난이도:** \${DIFFICULTY}

JSON 형식으로 응답 (마크다운 없이 순수 JSON, 모든 값은 한 줄):
{
  "question": "복합 시나리오 (구체적 수치 포함)",
  "constraint": ["기술 제약", "비즈니스 제약", "운영 제약"],
  "options": {
    "A": "선택지 A: 구체적 AWS 서비스 조합과 데이터 흐름을 3-4줄로 상세히 서술 (예: Amazon EC2 Auto Scaling으로... RDS Multi-AZ로... CloudFront로... S3로 전달)",
    "B": "선택지 B: 다른 서비스 조합을 3-4줄로 상세히 서술 (구체적 설정값 포함)",
    "C": "선택지 C: 또 다른 서비스 조합을 3-4줄로 상세히 서술 (성능/비용/가용성 명시)",
    "D": "선택지 D: 마지막 서비스 조합을 3-4줄로 상세히 서술"
  },
  "answer": "C",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "goal": "이 문제가 테스트하는 핵심 목표",
  "easyMode": {
    "explanation": "정답을 초등학교 5학년 수준으로 설명. 비유법 사용. 정답의 핵심 기능 2-3가지 나열",
    "A": "선택지 A가 어떤 기능인지 어린이 수준으로 설명",
    "B": "선택지 B가 어떤 기능인지 어린이 수준으로 설명",
    "C": "선택지 C가 어떤 기능인지 어린이 수준으로 설명",
    "D": "선택지 D가 어떤 기능인지 어린이 수준으로 설명"
  },
  "explanation": {
    "architecture": "아키텍처 흐름과 각 컴포넌트의 역할",
    "correct": "정답이 왜 모든 제약을 만족하는지 기술적으로 상세히",
    "service_features": "정답에 포함된 AWS 서비스의 핵심 특징과 한계",
    "trap_A": "선택지 A가 정확히 어느 제약을 미충족하는지 + 기술적 이유",
    "trap_B": "선택지 B가 정확히 어느 제약을 미충족하는지 + 기술적 이유",
    "trap_C": "선택지 C가 정확히 어느 제약을 미충족하는지 + 기술적 이유"
  },
  "patterns": ["패턴1: 시험에 자주 출제되는 개념", "패턴2: 유사 서비스와의 차이점"]
}`;

/**
 * 난이도: 챌린지 (실무 수준)
 * - 3~4개 AWS 서비스 복합 조합
 * - 3개의 매우 정교한 함정답 (각각 서로 다른 미충족 요소)
 * - 실제 Examtopics 최고 난이도 수준
 */
export const SAA_PROBLEM_PROMPT_CHALLENGE = `당신은 AWS SAA-C03 시험 출제 전문가입니다.
다음은 "챌린지" 난이도의 예시 입니다. 매우 정교하고 현실감 높은 아키텍처 문제를 분석하세요.

## 예시: 최고 난이도 문제 (챌린지)

**특징**:
- 3~4개 AWS 서비스 조합 (예: VPC + Auto Scaling + RDS + CloudFront)
- 제약조건 3개 이상, 상호 연관성 높음
- 함정답: 매우 정교함 (거의 모든 조건을 만족하지만 1개 세부 사항 놓침)
- 실무 상황: "온프레미스 ↔ AWS 하이브리드", "멀티 리전", "규제 준수" 등

**시나리오 예**:
"은행이 온프레미스 레거시 시스템에서 AWS로 마이그레이션.
월 10TB 거래 데이터, 99.99% 가용성, HIPAA 준수, 월 $50K 예산"

**제약조건**:
1. 기술: Direct Connect + Multi-AZ + 암호화
2. 비즈니스: 월 $50K, 데이터 완전성 보장
3. 운영: 기존 인력(AWS 미경험) 으로 관리 가능
4. 규제: HIPAA 준수, 데이터 거주지 미국 내

**함정답 구조**:
- A: Direct Connect + RDS Multi-AZ 하지만 HIPAA 감사 기능 미흡
- B: 모든 기술 + HIPAA 하지만 기존 인력으로 운영 어려움 (복잡함)
- C: 모든 조건 완벽 충족 ✅
- D: 기술은 최고 (Global Table) 하지만 비용 초과 + 불필요한 복잡성

**새로운 문제 조건**:
- 시나리오: 온프레미스 ↔ AWS, 멀티 리전, 규제/컴플라이언스, 마이그레이션 등 실무 시나리오
- 구체적 수치: 데이터량, 트래픽, 비용, 가용성, 규제 요구사항
- 제약: 기술(4개) + 비즈니스(2개) + 운영(2개) = 최소 3개 조합
- 선택지: 각 4~5줄, 아키텍처 명시, 보안/비용/성능 모두 포함 + 구체적 서비스 조합 서술
- 정답: 모든 제약 완벽 + 이유 설득력 높음
- 함정: A/B/D 각각 다른 부분 미충족 + 거의 맞음

**주어진 서비스:** \${SERVICE_NAMES}
**난이도:** \${DIFFICULTY}

JSON 형식으로 응답 (마크다운 없이 순수 JSON, 모든 값은 한 줄):
{
  "question": "실무 수준 복합 시나리오 (구체적 수치 포함)",
  "constraint": ["기술 제약 1", "기술 제약 2", "비즈니스 제약", "운영 제약"],
  "options": {
    "A": "선택지 A: AWS Direct Connect로 온프레미스와 연결하여... Multi-AZ RDS로... Auto Scaling EC2로... S3로 데이터 전송. 보안: VPC Endpoint, 암호화. 비용: 월 $40K. 운영: 기존 DBA 팀으로 관리 가능하나 보안 감사 도구 부족",
    "B": "선택지 B: 완전히 다른 아키텍처로 4~5줄 상세히 서술. 각 제약 충족 여부 명시 (기술/비용/규제/운영)",
    "C": "선택지 C: 또 다른 아키텍처로 4~5줄 상세히 서술. 모든 제약을 어떻게 충족하는지 명시",
    "D": "선택지 D: 마지막 아키텍처 옵션으로 4~5줄 서술. 기술 우수하지만 비용/운영 복잡성 증가"
  },
  "answer": "C",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "goal": "이 문제가 테스트하는 핵심 목표",
  "easyMode": {
    "explanation": "정답을 초등학교 5학년 수준으로 설명. 비유법 사용. 복합 시스템의 핵심 3-4가지 설명",
    "A": "선택지 A가 어떤 기능인지 어린이 수준으로 설명. 한계점 명시",
    "B": "선택지 B가 어떤 기능인지 어린이 수준으로 설명. 왜 부족한지",
    "C": "선택지 C가 어떤 기능인지 어린이 수준으로 설명",
    "D": "선택지 D가 어떤 기능인지 어린이 수준으로 설명. 왜 과도한지"
  },
  "explanation": {
    "architecture": "온프레미스 연결 경로, 멀티 리전 (필요시), 데이터 흐름, 각 컴포넌트의 역할 상세히",
    "correct": "모든 4개 제약을 어떻게 동시에 만족하는지 상세히 + 기술적 근거",
    "service_features": "정답에 포함된 각 AWS 서비스의 핵심 특징, 보안/성능/비용 특성, 한계",
    "trap_A": "선택지 A가 정확히 어느 제약(기술/비즈니스/운영/규제)을 미충족하는지 명시 + 기술적 이유",
    "trap_B": "선택지 B가 정확히 어느 제약을 미충족하는지 명시 + 실제 부작용",
    "trap_C": "선택지 C가 정확히 어느 제약을 미충족하는지 명시 + 비용/복잡성 영향"
  },
  "patterns": ["패턴1: 하이브리드 아키텍처의 핵심", "패턴2: 규제 준수와 기술의 충돌", "패턴3: 비용 vs 기술의 트레이드오프"]
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

Respond in JSON format (pure JSON, all values on single line, no markdown):
{
  "question": "Scenario... (2-4 sentences)",
  "constraint": ["constraint1", "constraint2", "constraint3"],
  "options": {
    "A": "Option A: Specific AWS service combination and data flow described in 3-4 lines (e.g., Deploy Amazon EC2 with... send to Amazon Kinesis... transform with Lambda... deliver to S3)",
    "B": "Option B: Different service combination described in 3-4 lines with specific configurations",
    "C": "Option C: Another service combination described in 3-4 lines with performance/cost/availability details",
    "D": "Option D: Last service combination described in 3-4 lines"
  },
  "answer": "B",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "goal": "Core objective this problem tests",
  "easyMode": {
    "explanation": "Explain correct answer at 5th grade level using analogies. List 2-3 key features with simple language",
    "A": "Explain option A in child-friendly language. State why it is weak",
    "B": "Explain option B in child-friendly language. State its limitations",
    "C": "Explain option C in child-friendly language",
    "D": "Explain option D in child-friendly language. State its drawbacks"
  },
  "explanation": {
    "architecture": "Overall architecture flow and role of each component",
    "correct": "Why answer meets all constraints with technical detail",
    "service_features": "Core characteristics and limitations of AWS services in the correct answer",
    "trap_A": "Which constraint option A fails to meet + technical reason",
    "trap_B": "Which constraint option B fails to meet + technical reason",
    "trap_C": "Which constraint option C fails to meet + technical reason"
  },
  "patterns": ["Pattern 1: Frequently tested concept", "Pattern 2: Comparison between similar services"]
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

export const SAA_PROBLEM_PROMPT_EN_HARD = `You are an AWS SAA-C03 exam expert.
The following shows a "Hard" difficulty-level example. Analyze complex constraints and sophisticated trap answer structures.

## Example: Complex Multi-Service Problem (Hard Difficulty)

**Characteristics:**
- Combines 2-3 AWS services to solve
- 2-3 interconnected constraints
- Trick answers: Almost correct but missing one aspect (cost, performance, or operational efficiency)
- Real-world scenarios with specific numbers and business context

**Example Scenario:** "500GB monthly data, 2000 requests/sec, 99.9% availability required"
**Constraints:**
1. Performance: Latency < 100ms
2. Cost: Under $5,000/month
3. Availability: 99.9% (Multi-AZ)

**Trap Answer Structure:**
- A: Meets cost but lacks performance (single AZ)
- B: Performance + availability OK but exceeds budget
- C: All constraints satisfied ✅
- D: Highest performance but 2x cost + unnecessary features

**New Problem Requirements:**
- Scenario: 3-4 specific numbers (data volume, traffic, retention, cost)
- Constraints: Technical + Business + Operational (3 types)
- Options: Each 3-4 lines with service names + config values + specific architecture description
- Correct answer: Satisfies all constraints perfectly
- Trap answers: Each fails 1 different constraint

**Given Services:** \${SERVICE_NAMES}
**Difficulty:** \${DIFFICULTY}

Response in JSON format (pure JSON, all values on single line, no markdown):
{
  "question": "Complex scenario (specific numbers included)",
  "constraint": ["Technical constraint", "Business constraint", "Operational constraint"],
  "options": {
    "A": "Option A: Specific AWS service combination with architecture described in 3-4 lines (e.g., Deploy Auto Scaling EC2 with Multi-AZ RDS, use CloudFront for... store in S3 with...)",
    "B": "Option B: Different service combination described in 3-4 lines with cost and performance details",
    "C": "Option C: Another service combination described in 3-4 lines meeting all constraints",
    "D": "Option D: Alternative service combination described in 3-4 lines (possible but excessive or over-budget)"
  },
  "answer": "C",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "goal": "Core objective this problem tests",
  "easyMode": {
    "explanation": "Explain correct answer at 5th grade level using analogies. Describe 2-3 key features simply",
    "A": "Explain option A in child-friendly language. State its weakness",
    "B": "Explain option B in child-friendly language. State its limitation",
    "C": "Explain option C in child-friendly language",
    "D": "Explain option D in child-friendly language. State why it is excessive"
  },
  "explanation": {
    "architecture": "2-3 service combination and overall architecture flow with role of each component",
    "correct": "How each constraint is satisfied + technical reasoning + cost/performance calculation",
    "service_features": "Each AWS service characteristics, limitations, and performance/cost implications",
    "trap_A": "Which constraint is missed + why this choice fails + technical reason",
    "trap_B": "Which constraint is missed + specific cost/performance impact",
    "trap_C": "Which constraint is missed + alternative solution or budget overage"
  },
  "patterns": ["Core pattern 1: Frequently tested concept", "Core pattern 2: Service comparison and tradeoffs"]
}`;

export const SAA_PROBLEM_PROMPT_EN_CHALLENGE = `You are an AWS SAA-C03 exam expert.
The following shows a "Challenge" difficulty-level example. Analyze highly sophisticated and realistic architecture problems.

## Example: Highest Difficulty Problem (Challenge)

**Characteristics:**
- 3-4 AWS services combined (e.g., VPC + Auto Scaling + RDS + CloudFront)
- 3+ interconnected constraints with high correlation
- Trick answers: Extremely sophisticated (satisfies almost all conditions but misses 1 critical detail)
- Real-world situations: "On-premises ↔ AWS hybrid", "Multi-region", "Compliance requirements"

**Example Scenario:**
"Bank migrating legacy on-premises system to AWS.
Monthly 10TB transaction data, 99.99% availability, HIPAA compliance, $50K monthly budget"

**Constraints:**
1. Technical: Direct Connect + Multi-AZ + Encryption
2. Business: $50K monthly, data integrity guaranteed
3. Operational: Manageable by existing staff (AWS-inexperienced)
4. Regulatory: HIPAA compliance, data residency within US

**Trap Answer Structure:**
- A: Direct Connect + RDS Multi-AZ but HIPAA audit functions insufficient
- B: All technical + HIPAA but hard for existing staff to operate (too complex)
- C: All constraints perfectly satisfied ✅
- D: Highest tech (Global Table) but cost exceeds budget + unnecessary complexity

**New Problem Requirements:**
- Scenario: On-premises ↔ AWS, multi-region, compliance, migration context with 4+ specific numbers
- Specific numbers: Data volume, traffic, cost, availability, compliance requirements
- Constraints: Technical (4) + Business (2) + Operational (2) = minimum 3 combined
- Options: Each 4-5 lines with architecture, security, cost, and performance details + specific service descriptions
- Correct answer: All constraints satisfied + highly persuasive reasoning
- Trap answers: A/B/D each misses different aspects + almost correct

**Given Services:** \${SERVICE_NAMES}
**Difficulty:** \${DIFFICULTY}

Response in JSON format (pure JSON, all values on single line, no markdown):
{
  "question": "Production-grade complex scenario (on-premises migration, multi-region, compliance with specific numbers)",
  "constraint": ["Technical constraint 1", "Technical constraint 2", "Business constraint", "Operational constraint"],
  "options": {
    "A": "Option A: Use AWS Direct Connect to connect on-premises... Multi-AZ RDS for... Auto Scaling EC2 for... S3 for data storage. Security: VPC Endpoint, encryption. Cost: $40K/month. Operational: Existing team can manage but missing security audit tool",
    "B": "Option B: Alternative architecture with 4-5 lines describing services, security, cost, and operational complexity. Specify which constraint it fails to meet",
    "C": "Option C: Another architecture option with 4-5 lines describing complete solution that meets all 4 constraints with details on cost/security/compliance",
    "D": "Option D: Final option with 4-5 lines. Technically superior but over-budget or unnecessarily complex. Specify the specific constraint it violates"
  },
  "answer": "C",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "goal": "Core objective this problem tests (e.g., designing compliant hybrid architecture within budget)",
  "easyMode": {
    "explanation": "Explain correct answer at 5th grade level. Describe the core solution in simple terms with 3-4 key ideas",
    "A": "Explain option A in child-friendly language. State which part is weak (security, budget, or management)",
    "B": "Explain option B in child-friendly language. State why it does not work well",
    "C": "Explain option C in child-friendly language. Emphasize why it is the best choice",
    "D": "Explain option D in child-friendly language. State why it is too expensive or complex"
  },
  "explanation": {
    "architecture": "3-4 services, on-premises connectivity path (Direct Connect, VPN, etc.), migration approach, detailed data flow, multi-region strategy if applicable",
    "correct": "Detailed proof of how all 4 constraints are satisfied + why this is optimal + cost/compliance/performance calculations",
    "service_features": "Each service's purpose + core characteristics + limitations + security/compliance implications + cost model + synergy when combined",
    "trap_A": "Which constraint(s) missed (e.g., regulatory/audit requirement, operational complexity, cost, availability) + specific technical reason + real-world impact",
    "trap_B": "Which constraint(s) missed + why existing team cannot effectively manage + hidden operational costs",
    "trap_C": "Which constraint(s) missed (e.g., budget exceeded, over-engineered) + specific cost overage + unnecessary features"
  },
  "patterns": ["Core pattern 1: Hybrid architecture design principles", "Core pattern 2: Compliance and security tradeoffs", "Core pattern 3: Cost optimization vs technical sophistication"]
}`;

export const SAA_PROBLEM_PROMPT_JA_HARD = `あなたはAWS SAA-C03試験の専門家です。
以下の「難しい」難易度の例題を分析してください。複雑な制約条件と洗練されたトリック選択肢の構造を理解します。

## 例: 複合マルチサービス問題 (難しい難易度)

**特徴:**
- 2~3個のAWSサービスを組み合わせて解決
- 2~3個の相互に関連する制約条件
- トリック選択肢: ほぼ正しいが、コスト、パフォーマンス、運用効率のいずれかが欠落
- 実世界シナリオ(具体的な数値とビジネスコンテキスト含む)

**シナリオ例:** 「月間500GBデータ、毎秒2000リクエスト、99.9%可用性要件」
**制約条件:**
1. パフォーマンス: レイテンシ < 100ms
2. コスト: 月額5,000ドル以下
3. 可用性: 99.9% (マルチAZ)

**トリック選択肢構造:**
- A: コストは満たすがパフォーマンス不足 (シングルAZ)
- B: パフォーマンス + 可用性OK だが予算超過
- C: すべての制約を満たす ✅
- D: 最高パフォーマンスだが2倍コスト + 不必要な機能

**新しい問題の要件:**
- シナリオ: 3~4個の具体的な数値 (データ量、トラフィック、保持期間、コスト)
- 制約条件: 技術 + ビジネス + 運用 (3タイプ)
- 選択肢: 各3~4行でサービス名 + 設定値を明記
- 正解: すべての制約を完璧に満たす
- トリック選択肢: 各々異なる1つの制約を欠落

**与えられたサービス:** \${SERVICE_NAMES}
**難易度:** \${DIFFICULTY}

JSON形式で応答 (マークダウンなし、純粋なJSON、すべての値は1行):
{
  "question": "複雑なシナリオ(具体的な数値含む)",
  "constraint": ["技術的制約", "ビジネス制約", "運用的制約"],
  "options": {
    "A": "選択肢 A: 具体的なAWSサービス組み合わせとデータフロー 3~4行で詳述 (例: Amazon EC2 Auto Scaling使用... RDS Multi-AZ... CloudFront使用... S3に転送)",
    "B": "選択肢 B: 異なるサービス組み合わせ 3~4行で詳述 (コスト・パフォーマンス詳記)",
    "C": "選択肢 C: 別のサービス組み合わせ 3~4行で詳述 (すべての制約満たす)",
    "D": "選択肢 D: 最後のサービス組み合わせ 3~4行で詳述"
  },
  "answer": "C",
  "keywords": ["キーワード1", "キーワード2", "キーワード3"],
  "goal": "この問題の核心的な目標",
  "easyMode": {
    "explanation": "正解を小学5年生レベルで説明。比喩法使用。核心機能2~3個を簡潔に",
    "A": "選択肢 A を子どもレベルで説明",
    "B": "選択肢 B を子どもレベルで説明",
    "C": "選択肢 C を子どもレベルで説明",
    "D": "選択肢 D を子どもレベルで説明"
  },
  "explanation": {
    "architecture": "2~3個サービス組み合わせ、アーキテクチャフロー、各コンポーネントの役割",
    "correct": "各制約がどのように満たされるか + コスト/パフォーマンス計算 + 技術的詳細",
    "service_features": "各AWSサービスの特性、制限事項、パフォーマンス・コスト影響",
    "trap_A": "どの制約が欠落 + なぜこの選択肢がダメか",
    "trap_B": "どの制約が欠落 + 具体的なコスト/パフォーマンス数値",
    "trap_C": "どの制約が欠落 + 代替案提示"
  },
  "patterns": ["コアパターン 1", "コアパターン 2"]
}`;

export const SAA_PROBLEM_PROMPT_JA_CHALLENGE = `あなたはAWS SAA-C03試験の専門家です。
以下は「チャレンジ」難易度の例題です。非常に高度で現実的なアーキテクチャ問題を分析してください。

## 例: 最高難易度問題 (チャレンジ)

**特徴:**
- 3~4個のAWSサービス組み合わせ (例: VPC + Auto Scaling + RDS + CloudFront)
- 3個以上の相互に関連する制約条件(相関性高い)
- トリック選択肢: 非常に高度 (ほぼすべての条件を満たすが1つの重要な詳細を見落とし)
- 実務状況: 「オンプレミス ↔ AWS ハイブリッド」「マルチリージョン」「コンプライアンス要件」

**シナリオ例:**
「銀行がオンプレミスのレガシーシステムをAWSに移行。
月間10TBトランザクションデータ、99.99%可用性、HIPAA準拠、月額50K予算」

**制約条件:**
1. 技術: Direct Connect + マルチAZ + 暗号化
2. ビジネス: 月額50K、データ完全性保証
3. 運用: 既存スタッフ(AWS未経験)で管理可能
4. 規制: HIPAA準拠、データレジデンシ米国内

**トリック選択肢構造:**
- A: Direct Connect + RDS マルチAZ だがHIPAA監査機能不足
- B: すべての技術 + HIPAA だが既存スタッフの運用困難 (複雑)
- C: すべての制約を完璧に満たす ✅
- D: 最高技術 (グローバルテーブル) だが予算超過 + 不必要な複雑性

**新しい問題の要件:**
- シナリオ: オンプレミス ↔ AWS、マルチリージョン、コンプライアンス、移行コンテキスト (4個以上の具体的な数値含む)
- 具体的な数値: データ量、トラフィック、コスト、可用性、コンプライアンス要件
- 制約条件: 技術(4個) + ビジネス(2個) + 運用(2個) = 最小3個組み合わせ
- 選択肢: 各4~5行でアーキテクチャ、セキュリティ、コスト、パフォーマンス詳細含む + 具体的なサービス組み合わせ記述
- 正解: すべての制約を満たす + 説得力高い
- トリック選択肢: A/B/D 各々異なる部分欠落 + ほぼ正しい

**与えられたサービス:** \${SERVICE_NAMES}
**難易度:** \${DIFFICULTY}

JSON形式で応答 (マークダウンなし、純粋なJSON、すべての値は1行):
{
  "question": "実務レベル複合シナリオ(オンプレミス移行、マルチリージョン、規制対応、4個以上の数値含む)",
  "constraint": ["技術的制約 1", "技術的制約 2", "ビジネス制約", "運用的制約"],
  "options": {
    "A": "選択肢 A: AWS Direct Connectでオンプレミス接続... マルチAZ RDSで... Auto Scaling EC2で... S3にデータ転送. セキュリティ: VPCエンドポイント、暗号化. コスト: 月額40K. 運用: 既存DBAで管理可能だが監査機能不足",
    "B": "選択肢 B: 別のアーキテクチャ 4~5行で詳述 (各制約充足状況明記)",
    "C": "選択肢 C: 別のアーキテクチャ 4~5行で詳述 (すべての制約をどのように充足するか明記)",
    "D": "選択肢 D: 最後のアーキテクチャ 4~5行で詳述 (技術は優れてもコスト/運用複雑)"
  },
  "answer": "C",
  "keywords": ["キーワード1", "キーワード2", "キーワード3"],
  "goal": "この問題が試験する核心的な目標",
  "easyMode": {
    "explanation": "正解を小学5年生レベルで説明。比喩法使用。複合システムの核心3~4個を簡潔に",
    "A": "選択肢 A を子どもレベルで説明。弱点を明記",
    "B": "選択肢 B を子どもレベルで説明。足りない部分を説明",
    "C": "選択肢 C を子どもレベルで説明",
    "D": "選択肢 D を子どもレベルで説明。なぜ過度か説明"
  },
  "explanation": {
    "architecture": "オンプレミス接続経路(Direct Connect/VPN等)、マルチリージョン戦略(必要な場合)、移行アプローチ、詳細なデータフロー、各コンポーネント役割",
    "correct": "4個すべての制約をどのように同時に満たすか詳細に + 技術的根拠 + コスト/規制/パフォーマンス計算",
    "service_features": "各AWS サービスの目的 + 核心特性 + 制限事項 + セキュリティ/規制への影響 + コストモデル + 組み合わせ時のシナジー",
    "trap_A": "どの制約が欠落 (規制/監査要件、運用複雑性、コスト、可用性等) + 具体的な技術的理由 + 実務への影響",
    "trap_B": "どの制約が欠落 + なぜ既存チームでは効果的に管理できないか + 隠れた運用コスト",
    "trap_C": "どの制約が欠落 (予算超過、過度設計等) + 具体的な超過額 + 不必要な機能"
  },
  "patterns": ["コアパターン 1: ハイブリッドアーキテクチャ設計原則", "コアパターン 2: コンプライアンスとセキュリティのトレードオフ", "コアパターン 3: コスト最適化 vs 技術的洗練度"]
}`;

export const DIFFICULTY_LABELS = {
  ko: { medium: "보통", hard: "어려움", challenge: "챌린지" },
  ja: { medium: "普通", hard: "難しい", challenge: "チャレンジ" },
  en: { medium: "Medium", hard: "Hard", challenge: "Challenge" },
} as const;

export function generatePrompt(
  serviceNames: string[],
  difficulty: string,
  locale: "ko" | "ja" | "en" = "ko"
): string {
  // 난이도별로 다른 프롬프트 선택
  let prompt: string;

  if (locale === "ko") {
    if (difficulty === "hard") {
      prompt = SAA_PROBLEM_PROMPT_HARD;
    } else if (difficulty === "challenge") {
      prompt = SAA_PROBLEM_PROMPT_CHALLENGE;
    } else {
      prompt = SAA_PROBLEM_PROMPT_MEDIUM;
    }
  } else if (locale === "ja") {
    if (difficulty === "hard") {
      prompt = SAA_PROBLEM_PROMPT_JA_HARD;
    } else if (difficulty === "challenge") {
      prompt = SAA_PROBLEM_PROMPT_JA_CHALLENGE;
    } else {
      prompt = SAA_PROBLEM_PROMPT_JA;
    }
  } else {
    if (difficulty === "hard") {
      prompt = SAA_PROBLEM_PROMPT_EN_HARD;
    } else if (difficulty === "challenge") {
      prompt = SAA_PROBLEM_PROMPT_EN_CHALLENGE;
    } else {
      prompt = SAA_PROBLEM_PROMPT_EN;
    }
  }

  const diffLabel = DIFFICULTY_LABELS[locale][difficulty as "medium" | "hard" | "challenge"] || difficulty;

  const tokenConstraint = locale === "ko"
    ? `\n\n⚠️ **중요한 제약사항**:\n- 응답은 최대 2500 토큰으로 제한됩니다.\n- 불필요한 설명이나 중복은 제거하세요.\n- JSON 구조는 반드시 완전해야 합니다 (빠짐 없이 모든 필드 포함).\n- 각 필드는 간결하면서도 명확하게 작성하세요.`
    : locale === "ja"
    ? `\n\n⚠️ **重要な制約**:\n- レスポンスは最大2500トークンに制限されています。\n- 不要な説明や重複は削除してください。\n- JSON構造は完全である必要があります（すべてのフィールドが含まれている）。\n- 各フィールドは簡潔でありながら明確に記述してください。`
    : `\n\n⚠️ **Important Token Constraint**:\n- Keep your response within 2500 tokens maximum.\n- Remove unnecessary explanations or duplications.\n- The JSON structure must be complete (all fields must be included).\n- Write each field concisely but clearly.`;

  return (prompt
    .replace("${SERVICE_NAMES}", serviceNames.join(", "))
    .replace("${DIFFICULTY}", diffLabel) + tokenConstraint);
}
