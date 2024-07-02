import { S3Client } from "@/utils/s3";



export async function onRequest(context) {
  const { request, env } = context;
  const NEW_ACCESS_KEY_ID = env.NEW_ACCESS_KEY_ID || '8f70c6c6a8d964bec51abcf4b57022a4';
  const NEW_SECRET_ACCESS_KEY = env.NEW_SECRET_ACCESS_KEY  || '0fecc90f43f15f0230ee16b12ba84cd7e6580c61df576fa055c52cf58182c891';
  const NEW_ENDPOINT = env.NEW_ENDPOINT || 'https://416c8dfd48d7017aa7d3dc38412356ca.r2.cloudflarestorage.com';
  const NEW_CF_ACCOUNT_ID = env.NEW_CF_ACCOUNT_ID || '416c8dfd48d7017aa7d3dc38412356ca';
  const BUCKET_NAME = 'uploader';


  const client = new S3Client(NEW_ACCESS_KEY_ID, NEW_SECRET_ACCESS_KEY);
  const forwardUrl = request.url.replace(
    /.*\/api\/write\/s3\//,
    `https://${NEW_CF_ACCOUNT_ID}.r2.cloudflarestorage.com/`
  );

  return client.s3_fetch(forwardUrl, {
    method: request.method,
    body: request.body,
    headers: request.headers,
  });
}