#!/usr/bin/env python3
import os
import sys
import boto3
from pathlib import Path
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# AWS credentials 읽기
access_key = os.getenv('AWS_ACCESS_KEY_ID')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
region = os.getenv('AWS_REGION', 'us-east-1')
bucket = os.getenv('AWS_S3_BUCKET')

if not access_key or not secret_key or not bucket:
    print("❌ 에러: .env 파일에 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET이 필요합니다.")
    sys.exit(1)

print("🚀 AWS S3 배포 시작")
print(f"📦 버킷: {bucket}")
print(f"🌍 리전: {region}")
print("")

# S3 클라이언트 생성
s3_client = boto3.client(
    's3',
    region_name=region,
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key
)

# MIME 타입 추측
MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
}

def get_mime_type(file_path):
    ext = Path(file_path).suffix.lower()
    return MIME_TYPES.get(ext, 'application/octet-stream')

def upload_file(file_path, s3_key):
    try:
        mime_type = get_mime_type(file_path)
        cache_control = 'no-cache, no-store, must-revalidate' if s3_key.endswith('.html') else 'max-age=31536000'

        s3_client.upload_file(
            file_path,
            bucket,
            s3_key,
            ExtraArgs={
                'ContentType': mime_type,
                'CacheControl': cache_control
            }
        )
        print(f"✅ 업로드: {s3_key}")
    except Exception as e:
        print(f"❌ 실패: {s3_key} - {str(e)}")
        raise

def delete_existing_files():
    try:
        print("🧹 기존 S3 파일 확인 중...")
        response = s3_client.list_objects_v2(Bucket=bucket)

        if 'Contents' in response:
            print(f"⚠️  {len(response['Contents'])}개의 기존 파일이 발견됨. 삭제 중...")
            for obj in response['Contents']:
                s3_client.delete_object(Bucket=bucket, Key=obj['Key'])
                print(f"🗑️  삭제: {obj['Key']}")
    except Exception as e:
        print(f"⚠️  기존 파일 확인 실패: {str(e)}")

def deploy():
    try:
        # 기존 파일 삭제
        delete_existing_files()

        print("")
        print("📤 새 파일 업로드 중...")

        # dist 폴더 확인
        dist_path = Path('dist')
        if not dist_path.exists():
            print("❌ dist 폴더가 없습니다. npm run build를 먼저 실행하세요.")
            sys.exit(1)

        # 모든 파일 업로드
        files = list(dist_path.rglob('*'))
        file_count = len([f for f in files if f.is_file()])
        print(f"📁 총 {file_count}개의 파일 발견")
        print("")

        for file_path in files:
            if file_path.is_file():
                relative_path = file_path.relative_to(dist_path)
                s3_key = str(relative_path).replace('\\', '/')
                upload_file(str(file_path), s3_key)

        print("")
        print("✨ 배포 완료!")
        print(f"🌐 사이트: https://{bucket}")

    except Exception as e:
        print(f"❌ 배포 실패: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    deploy()
