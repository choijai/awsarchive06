#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// ✅ AWS credentials 읽기 (환경변수에서)
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET;

if (!accessKeyId || !secretAccessKey || !bucket) {
  console.error('❌ 에러: .env 파일에 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET이 필요합니다.');
  process.exit(1);
}

console.log(`🚀 AWS S3 배포 시작`);
console.log(`📦 버킷: ${bucket}`);
console.log(`🌍 리전: ${region}`);
console.log('');

// ✅ S3 클라이언트 생성
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

// MIME 타입 추측
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
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
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// 재귀적으로 dist 폴더의 모든 파일 가져오기
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// S3에 파일 업로드
async function uploadFile(filePath, s3Key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const mimeType = getMimeType(filePath);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: fileContent,
      ContentType: mimeType,
      // 캐싱 설정 (.html 파일은 캐싱하지 않음)
      CacheControl: s3Key.endsWith('.html') ? 'no-cache, no-store, must-revalidate' : 'max-age=31536000',
    });

    await s3Client.send(command);
    console.log(`✅ 업로드: ${s3Key}`);
  } catch (error) {
    console.error(`❌ 실패: ${s3Key} - ${error.message}`);
    throw error;
  }
}

// 기존 S3 파일 삭제
async function deleteExistingFiles() {
  try {
    console.log('🧹 기존 S3 파일 확인 중...');
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: '',
    });

    const listResponse = await s3Client.send(listCommand);

    if (listResponse.Contents && listResponse.Contents.length > 0) {
      console.log(`⚠️  ${listResponse.Contents.length}개의 기존 파일이 발견됨. 삭제 중...`);

      for (const item of listResponse.Contents) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucket,
          Key: item.Key,
        });
        await s3Client.send(deleteCommand);
        console.log(`🗑️  삭제: ${item.Key}`);
      }
    }
  } catch (error) {
    console.error(`⚠️  기존 파일 확인 실패: ${error.message}`);
  }
}

// 메인 함수
async function deploy() {
  try {
    // 기존 파일 삭제
    await deleteExistingFiles();

    console.log('');
    console.log('📤 새 파일 업로드 중...');

    // dist 폴더의 모든 파일 가져오기
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('❌ dist 폴더가 없습니다. npm run build를 먼저 실행하세요.');
      process.exit(1);
    }

    const files = getAllFiles(distPath);
    console.log(`📁 총 ${files.length}개의 파일 발견`);
    console.log('');

    // 파일 업로드
    for (const filePath of files) {
      const s3Key = path.relative(distPath, filePath).replace(/\\/g, '/');
      await uploadFile(filePath, s3Key);
    }

    console.log('');
    console.log('✨ 배포 완료!');
    console.log(`🌐 사이트: https://${bucket}`);
  } catch (error) {
    console.error('❌ 배포 실패:', error);
    process.exit(1);
  }
}

// 배포 실행
deploy();
