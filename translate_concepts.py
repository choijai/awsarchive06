#!/usr/bin/env python3
import re
import json
import os
from anthropic import Anthropic

# Read data.ts
import sys
script_dir = os.path.dirname(os.path.abspath(__file__))
data_ts_path = os.path.join(script_dir, 'src', 'data.ts')

with open(data_ts_path, 'r', encoding='utf-8') as f:
    data_content = f.read()

# Extract CONCEPTS object (between "export const CONCEPTS" and "};" at the end)
concepts_start = data_content.find('export const CONCEPTS: Record<string, Concept> = {')
if concepts_start == -1:
    print("Could not find CONCEPTS in data.ts")
    exit(1)

# Find the last closing brace for CONCEPTS
# We'll look for the pattern that indicates the end of CONCEPTS
search_from = concepts_start + len('export const CONCEPTS: Record<string, Concept> = ')
concepts_end = data_content.rfind('};')

if concepts_end == -1:
    print("Could not find end of CONCEPTS")
    exit(1)

# Extract the content (including the opening brace)
concepts_str = data_content[search_from:concepts_end]

# Initialize Anthropic client
# Load API key from .env file
api_key = os.getenv('VITE_ANTHROPIC_API_KEY')
if not api_key:
    # Try to load from .env file
    env_path = os.path.join(script_dir, '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('VITE_ANTHROPIC_API_KEY='):
                    api_key = line.split('=', 1)[1].strip()
                    break
if not api_key:
    print("VITE_ANTHROPIC_API_KEY not found in environment or .env file")
    exit(1)

client = Anthropic(api_key=api_key)

def translate_concepts(concepts_str, target_lang):
    """Translate concepts using Claude API"""

    prompt = f"""당신은 AWS 서비스 설명을 전문적으로 {'영어' if target_lang == 'en' else '일본어'}로 번역하는 전문가입니다.

다음 TypeScript 객체의 모든 텍스트 필드를 {'영어' if target_lang == 'en' else '일본어'}로 번역해주세요.

중요한 규칙:
1. AWS 서비스명(EC2, S3, Lambda, RDS, DynamoDB, VPC, ECS, EKS, Fargate, IAM, KMS, CloudFront, Route 53, ALB, ELB, SQS, SNS, EventBridge, Kinesis, Redshift, Glacier, Cognito, WAF, Shield, CloudTrail, CloudWatch, API Gateway, Direct Connect, Secrets Manager, Parameter Store, EventBridge, Aurora, ElastiCache, EFS, EBS, Beanstalk, Auto Scaling, Spot Instances, Reserved Instances, Dedicated Hosts 등)는 반드시 영어로 유지하세요.
2. 기술 용어는 영어로 유지하세요 (예: On-Demand, Reserved, Spot, OLAP, OLTP, JWT, STS, WORM, SSL/TLS, SLA, RTO, RPO, CIDR, NAT, ACL, Security Group, Subnet, Route Table, VPN, BGP, ASN, MTU, Bastion Host, VPC Peering, VPC Endpoint, S3 Transfer Acceleration, CloudFront Distribution, Origin, Edge Location, Regional Edge Cache, Lambda@Edge 등).
3. 자연스럽고 전문적인 {'영어' if target_lang == 'en' else '일본어'}로 번역하세요.
4. 같은 개념은 일관성 있게 번역하세요.
5. 비유나 설명(예: "반장", "금고", "냉동창고")은 자연스럽게 {'영어' if target_lang == 'en' else '일본어'}식 표현으로 바꾸세요.

다음 객체를 번역해주세요 (JSON 형식으로만 응답):

{concepts_str}

번역 결과는 원본과 동일한 구조의 JSON으로 반환해주세요. 다른 설명이나 주석 없이 JSON만 제공하세요."""

    print(f"Translating to {target_lang}...")

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4000,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    result = response.content[0].text

    # Extract JSON from response
    json_match = re.search(r'\{[\s\S]*\}', result)
    if json_match:
        return json_match.group(0)
    else:
        print(f"Could not extract JSON from response for {target_lang}")
        return None

# Translate to English and Japanese
print("Starting translation process...")
print("=" * 50)

en_result = translate_concepts(concepts_str, 'en')
ja_result = translate_concepts(concepts_str, 'ja')

if not en_result or not ja_result:
    print("Translation failed")
    exit(1)

print("=" * 50)
print("Translations completed successfully!")
print("\nGenerating new data.ts file...")

# Get the parts before CONCEPTS
before_concepts = data_content[:concepts_start]
after_concepts = data_content[concepts_end + len('} as const;'):]

# Create new data.ts with all three versions
new_data = f"""{before_concepts}export const CONCEPTS_KO: Record<string, Concept> = {concepts_str}}} as const;

export const CONCEPTS_EN: Record<string, Concept> = {en_result}}} as const;

export const CONCEPTS_JA: Record<string, Concept> = {ja_result}}} as const;

// Default export (KO version for backward compatibility)
export const CONCEPTS = CONCEPTS_KO;
{after_concepts}"""

# Backup original file
backup_path = os.path.join(script_dir, 'src', 'data.ts.backup')
with open(backup_path, 'w', encoding='utf-8') as f:
    f.write(data_content)
print(f"Backup saved to {backup_path}")

# Write new file
with open(data_ts_path, 'w', encoding='utf-8') as f:
    f.write(new_data)

print("✅ data.ts updated successfully!")
print("\nSummary:")
print("- CONCEPTS_KO: Korean version")
print("- CONCEPTS_EN: English version")
print("- CONCEPTS_JA: Japanese version")
print("- CONCEPTS: Alias to CONCEPTS_KO (for backward compatibility)")
