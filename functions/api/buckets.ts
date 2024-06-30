import { S3Client } from "@/utils/s3";

const NEW_ACCESS_KEY_ID = "8f70c6c6a8d964bec51abcf4b57022a4";
const NEW_SECRET_ACCESS_KEY = "0fecc90f43f15f0230ee16b12ba84cd7e6580c61df576fa055c52cf58182c891";
const NEW_CF_ACCOUNT_ID = "416c8dfd48d7017aa7d3dc38412356ca";
const NEW_BUCKET_NAME = "uploader";
const NEW_ENDPOINT = `https://${NEW_CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;

async function getCurrentBucket(context) {
  const { request } = context;
  const url = new URL(request.url);
  const driveid = url.hostname.replace(/\..*/, "");

  const client = new S3Client(NEW_ACCESS_KEY_ID, NEW_SECRET_ACCESS_KEY, NEW_ENDPOINT);
  const bucketsResponse = await client.listBuckets();
  const bucketsText = await bucketsResponse.text();
  const bucketNames = [
    ...bucketsText.matchAll(/<Name>([0-9a-z-]*)<\/Name>/g),
  ].map((match) => match[1]);

  const currentBucket = await Promise.any(
    bucketNames.map(
      (name) =>
        new Promise<string>((resolve, reject) => {
          client
            .s3_fetch(
              `${NEW_ENDPOINT}/${name}/_$flaredrive$/CNAME`
            )
            .then((response) => response.text())
            .then((text) => {
              if (text === url.hostname) resolve(name);
              else reject();
            })
            .catch(() => reject());
        })
    )
  );

  return new Response(currentBucket, {
    headers: { "cache-control": "max-age=604800" },
  });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const url = new URL(request.url);
    if (url.searchParams.has("current")) return await getCurrentBucket(context);

    const client = new S3Client(
      NEW_ACCESS_KEY_ID, NEW_SECRET_ACCESS_KEY,NEW_ENDPOINT
    );
    return client.s3_fetch(
      `https://${NEW_CF_ACCOUNT_ID}.r2.cloudflarestorage.com/`
    );
  } catch (e) {
    return new Response(e.toString(), { status: 500 });
  }
}
