import { S3Client } from "@/utils/s3";

const NEW_ACCESS_KEY_ID = "8f70c6c6a8d964bec51abcf4b57022a4";
const NEW_SECRET_ACCESS_KEY = "0fecc90f43f15f0230ee16b12ba84cd7e6580c61df576fa055c52cf58182c891";
const NEW_CF_ACCOUNT_ID = "416c8dfd48d7017aa7d3dc38412356ca";
const NEW_BUCKET_NAME = "uploader";
const NEW_ENDPOINT = `https://${NEW_CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export async function onRequest(context) {
  const { request } = context;

  const client = new S3Client(NEW_ACCESS_KEY_ID, NEW_SECRET_ACCESS_KEY,NEW_ENDPOINT);
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

export async function onRequestCreateBucket(context) {
  const client = new S3Client(
    NEW_ACCESS_KEY_ID,
    NEW_SECRET_ACCESS_KEY,
    NEW_ENDPOINT
  );

  try {
    await client.createBucket(NEW_BUCKET_NAME);
    return new Response(`Bucket ${NEW_BUCKET_NAME} created successfully`, {
      status: 201,
    });
  } catch (error) {
    return new Response(`Failed to create bucket: ${error.message}`, {
      status: 500,
    });
  }
}

export async function onRequestListBuckets(context) {
  const client = new S3Client(
    NEW_ACCESS_KEY_ID,
    NEW_SECRET_ACCESS_KEY,
    NEW_ENDPOINT
  );

  try {
    const response = await client.listBuckets();
    const bucketsText = await response.text();
    const bucketNames = [
      ...bucketsText.matchAll(/<Name>([0-9a-z-]*)<\/Name>/g),
    ].map((match) => match[1]);

    return new Response(JSON.stringify({ buckets: NEW_BUCKET_NAME }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(`Failed to list buckets: ${error.message}`, {
      status: 500 },
    );
  }
}