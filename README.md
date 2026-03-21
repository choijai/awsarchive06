# 🎓 AWS SSA 시험 준비 - 서비스 관계도 웹 애플리케이션

AWS Solutions Architect Associate (SAA-C03) 시험을 준비하기 위한 인터랙티브 서비스 관계도 시각화 도구입니다.

## 🚀 기능

- **31개 AWS 서비스** - Compute, Storage, Database, Network, Security, Messaging, Monitor 카테고리별 정리
- **인터랙티브 그래프** - 서비스 간의 관계를 시각화
- **상세 학습 자료** - 각 서비스마다:
  - 💡 쉬운 설명 (초급자 수준)
  - 🎯 핵심 포인트
  - 🔗 연관 서비스
- **검색 & 필터** - 서비스 이름, 설명으로 검색 및 카테고리별 필터링
- **반응형 디자인** - 데스크톱과 태블릿 최적화

## 📦 설치

```bash
npm install
```

## 🏃 빠른 시작

### 웹 버전 (Vite)
```bash
npm run dev
```

### Expo로 실행 (모바일 호환)
```bash
npm start
```

### 프로덕션 빌드
```bash
npm run build
npm run web:prod
```

## 📚 AWS 서비스 카테고리

- **🖥️ Compute** (5개): EC2, Lambda, ECS/EKS, Auto Scaling, Beanstalk
- **💾 Storage** (4개): S3, EBS, EFS, S3 Glacier
- **🗄️ Database** (5개): RDS, Aurora, DynamoDB, ElastiCache, Redshift
- **🌐 Network** (6개): VPC, ELB, CloudFront, Route 53, API Gateway, Direct Connect
- **🔐 Security** (5개): IAM, KMS, WAF & Shield, Cognito, Secrets Manager
- **📬 Messaging** (4개): SQS, SNS, EventBridge, Kinesis
- **👁️ Monitor** (2개): CloudWatch, CloudTrail

## 🎯 사용 방법

1. 그래프에서 서비스 선택
2. 오른쪽 패널에서 상세 정보 확인
3. "연관 서비스"로 관계 탐색
4. 카테고리 필터나 검색으로 원하는 서비스 찾기

## 🛠️ 기술 스택

- React 19 + TypeScript
- Vite (웹 번들러)
- SVG (그래프 시각화)
- CSS3 (반응형 디자인)
