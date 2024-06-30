import { S3Client } from "@/utils/s3";
import {listObjects} from '@/utils/aws';

async function getCurrentBucket(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const driveid = url.hostname.replace(/\..*/, "");

  if (!(await env[driveid].head("_$flaredrive$/CNAME")))
    await env[driveid].put("_$flaredrive$/CNAME", url.hostname);

  const client = new S3Client(env.NEW_ACCESS_KEY_ID, env.NEW_SECRET_ACCESS_KEY);
  const bucketsResponse = await client.s3_fetch(
    `https://${env.NEW_CF_ACCOUNT_ID}.r2.cloudflarestorage.com`
  );
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
              `https://${name}.${env.NEW_CF_ACCOUNT_ID}.r2.cloudflarestorage.com/_$flaredrive$/CNAME`
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
    if (url.searchParams.has("current")) return await listObjects(context);

    const client = new S3Client(
      env.NEW_ACCESS_KEY_ID,
      env.NEW_SECRET_ACCESS_KEY
    );
    return client.s3_fetch(
      `https://${env.NEW_CF_ACCOUNT_ID}.r2.cloudflarestorage.com/`
    );
   
  } catch (e) {
    return new Response(e.toString(), { status: 500 });
  }
}