import { S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.NEW_ACCESS_KEY_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.NEW_CF_ACCOUNT_ID || '',
        secretAccessKey: process.env.NEW_SECRET_ACCESS_KEY || '',
    },
});

console.log('-----CONSOLE-----', process.env.NEW_ACCESS_KEY_ID, process.env.NEW_CF_ACCOUNT_ID);