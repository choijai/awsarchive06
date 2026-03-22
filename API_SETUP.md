# Claude API 연동 설정 가이드

## 🚀 빠른 시작

### 1. API 키 발급받기
1. [Anthropic Console](https://console.anthropic.com) 접속
2. API Keys 섹션에서 새 키 생성
3. 키 복사

### 2. 환경 변수 설정

#### 방법 A: .env 파일 (권장)
`.env` 파일 편집:
```bash
REACT_APP_ANTHROPIC_API_KEY=sk-ant-xxxxxx
```

#### 방법 B: 환경 변수 (시스템)
Windows PowerShell:
```powershell
$env:REACT_APP_ANTHROPIC_API_KEY="sk-ant-xxxxxx"
npm start
```

Windows CMD:
```cmd
set REACT_APP_ANTHROPIC_API_KEY=sk-ant-xxxxxx
npm start
```

### 3. 앱 실행
```bash
npm start
```

## 📋 사용 방법

1. **서비스 선택**: 그래프에서 AWS 서비스 클릭 (최대 4개)
2. **난이도 선택**: 쉬움, 보통, 어려움 중 선택
3. **문제 생성**: "🚀 SAA-C03 문제 생성" 버튼 클릭
4. **보기 선택**: A~D 중 답을 선택
5. **결과 확인**: 정답/오답과 상세 설명 표시

## 🎯 프롬프트 특징

현재 프롬프트는 **Examtopics 수준**의 SAA-C03 문제 생성을 위해 최적화되어 있습니다:

✅ **현실감 높은 시나리오** (2-4문장 + 구체적 수치)
✅ **복합 제약 조건** (비용 + 성능 + 보안 등)
✅ **정교한 함정답** (거의 맞지만 1가지 조건 미충족)
✅ **상세한 설명** (AWS 공식 문서 기반)

## 📊 생성되는 문제 구조

```json
{
  "question": "시나리오...",
  "constraint": ["제약1", "제약2", "제약3"],
  "options": {
    "A": "선택지 A (3-4줄)",
    "B": "선택지 B (3-4줄)",
    "C": "선택지 C (3-4줄)",
    "D": "선택지 D (3-4줄)"
  },
  "answer": "B",
  "explanation": {
    "correct": "정답 설명",
    "trap_A": "A가 틀린 이유",
    "trap_C": "C가 틀린 이유",
    "trap_D": "D가 틀린 이유"
  },
  "patterns": ["핵심 패턴 1", "핵심 패턴 2"]
}
```

## 🔧 문제 해결

### "API 키가 설정되지 않음" 오류
- `.env` 파일에 `REACT_APP_ANTHROPIC_API_KEY=sk-ant-xxxxx` 추가
- 앱 재시작

### "API 오류" 메시지
- API 키 유효성 확인
- API 사용량 제한 확인 (콘솔에서)
- 네트워크 연결 확인

### 응답이 JSON이 아님
- 프롬프트가 마크다운 코드 블록으로 감싸진 JSON 반환 예상
- 파서가 자동으로 추출 시도

## 📈 프롬프트 개선 팁

### Few-shot 예시 추가
[prompts.ts](./src/prompts.ts)에 있는 예시 4개 (Q76~Q79)를 커스터마이징 가능

### 난이도별 패턴
- **쉬움**: 단순 서비스 조합 (2개 이하)
- **보통**: 3~4개 서비스 + 2개 제약조건
- **어려움**: 5개 이상 서비스 + 3개+ 제약조건 + 복합 시나리오

## 💡 고급 사용

### 커스텀 서비스 조합
코드 수정으로 특정 서비스만 문제 생성:
```typescript
const serviceNames = ["EC2", "RDS", "S3"]; // 선택지를 이 서비스들로 제한
const problem = await generateSAAProblem(serviceNames, "보통");
```

### 배치 문제 생성
```typescript
const problems = [];
for (let i = 0; i < 10; i++) {
  const problem = await generateSAAProblem(["S3", "Lambda", "DynamoDB"], "보통");
  problems.push(problem);
  await new Promise(r => setTimeout(r, 2000)); // API 제한 회피
}
```

## 📚 참고 자료
- [Anthropic API Docs](https://docs.anthropic.com)
- [Claude Models](https://docs.anthropic.com/en/docs/about-claude/models/latest)
- [AWS SAA-C03 시험 가이드](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
