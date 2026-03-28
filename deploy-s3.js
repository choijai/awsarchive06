const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// .env 읽기
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const s3Client = new S3Client({
  region: envVars.AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET = envVars.AWS_S3_BUCKET;
const DIST_DIR = path.join(__dirname, 'dist');

async function uploadDir(dirPath, s3Path = '') {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    const s3FilePath = s3Path ? `${s3Path}/${file.name}` : file.name;

    if (file.isDirectory()) {
      await uploadDir(filePath, s3FilePath);
    } else {
      const fileContent = fs.readFileSync(filePath);
      const contentType = getContentType(file.name);

      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3FilePath,
        Body: fileContent,
        ContentType: contentType,
        CacheControl: file.name.endsWith('.html') ? 'max-age=0, no-cache' : 'max-age=31536000'
      }));

      console.log(`✅ Uploaded: ${s3FilePath}`);
    }
  }
}

function getContentType(filename) {
  const ext = path.extname(filename);
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif'
  };
  return types[ext] || 'application/octet-stream';
}

async function deploy() {
  try {
    console.log(`🚀 Deploying to S3: ${BUCKET}`);
    console.log(`📁 Source: ${DIST_DIR}\n`);

    await uploadDir(DIST_DIR);

    console.log('\n✨ Deployment complete!');
    console.log(`🌐 Check: https://${BUCKET}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deploy();
