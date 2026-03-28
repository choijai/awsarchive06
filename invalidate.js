const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const cfClient = new CloudFrontClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY
  }
});

(async () => {
  try {
    const distId = 'E3UX780LBQGHIL';
    console.log('🔄 CloudFront 캐시 무효화:', distId);

    const result = await cfClient.send(new CreateInvalidationCommand({
      DistributionId: distId,
      InvalidationBatch: {
        Paths: { Quantity: 1, Items: ['/*'] },
        CallerReference: Date.now().toString()
      }
    }));

    console.log('✅ 무효화 생성:', result.Invalidation.Id);
    console.log('⏳ 상태:', result.Invalidation.Status);
    console.log('\n✨ 1-5분 후 캐시 갱신됨');
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
})();
