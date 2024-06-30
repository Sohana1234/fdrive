import AWS = require('aws-sdk');

// Configure AWS SDK with your Cloudflare R2 credentials and endpoint
export const s3 = new AWS.S3({
  accessKeyId: '8f70c6c6a8d964bec51abcf4b57022a4',
  secretAccessKey: '0fecc90f43f15f0230ee16b12ba84cd7e6580c61df576fa055c52cf58182c891',
  endpoint: 'https://416c8dfd48d7017aa7d3dc38412356ca.r2.cloudflarestorage.com',
  s3ForcePathStyle: true, 
  signatureVersion: 'v4'
});

// Function to list all buckets
export async function listBuckets() {
  try {
    const response = await s3.listBuckets().promise();
    console.log('Buckets:', response.Buckets);
  } catch (error) {
    console.error('Error listing buckets:', error);
  }
}

// Function to list objects in a specific bucket
export async function listObjects(bucketName) {
  try {
    const response = await s3.listObjectsV2({ Bucket: bucketName }).promise();
    console.log(`Objects in bucket "${bucketName}":`, response.Contents);
    return response;
  } catch (error) {
    console.error(`Error listing objects in bucket "${bucketName}":`, error);
  }
}

// Example usage
 (async () => {
  await listBuckets(); // List all buckets
  await listObjects('upload'); // List objects in a specific bucket
})();
