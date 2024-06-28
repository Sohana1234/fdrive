import { S3Client } from "@/utils/s3";

async function getCurrentBucket(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const driveid = url.hostname.replace(/\..*/, "");

  if (!(await env[driveid].head("_$flaredrive$/CNAME")))
    await env[driveid].put("_$flaredrive$/CNAME", url.hostname);

  const client = new S3Client("8f70c6c6a8d964bec51abcf4b57022a4", "0fecc90f43f15f0230ee16b12ba84cd7e6580c61df576fa055c52cf58182c891");
  const bucketName = 'uploader'; // Use the specified bucket name

  try {
    const response = await client.s3_fetch(
      `https://416c8dfd48d7017aa7d3dc38412356ca.r2.cloudflarestorage.com/${bucketName}/_$flaredrive$/CNAME`
    );
    const text = await response.text();
    if (text === url.hostname) {
      return new Response(bucketName, {
        headers: { "cache-control": "max-age=604800" },
      });
    } else {
      throw new Error("Bucket not found");
    }
  } catch (e) {
    return new Response(e.toString(), { status: 500 });
  }
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const url = new URL(request.url);
    if (url.searchParams.has("current")) return await getCurrentBucket(context);

    const client = new S3Client(
      "8f70c6c6a8d964bec51abcf4b57022a4",
      "0fecc90f43f15f0230ee16b12ba84cd7e6580c61df576fa055c52cf58182c891"
    );
    const bucketName = 'uploader'; // Use the specified bucket name
    return client.s3_fetch(
      `https://416c8dfd48d7017aa7d3dc38412356ca.r2.cloudflarestorage.com/${bucketName}/`
    );
  } catch (e) {
    return new Response(e.toString(), { status: 500 });
  }
}
