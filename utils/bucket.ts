
export function notFound() {
  return new Response("Not found", { status: 404 });
}

export function parseBucketPath(context): [any, string] {
  const { request, env, params } = context;
  const url = new URL(request.url);
  env.NEW_ACCESS_KEY_ID='8f70c6c6a8d964bec51abcf4b57022a4';
  env.NEW_SECRET_ACCESS_KEY='0fecc90f43f15f0230ee16b12ba84cd7e6580c61df576fa055c52cf58182c891';
  env.NEW_ENDPOINT='https://416c8dfd48d7017aa7d3dc38412356ca.r2.cloudflarestorage.com';
  env.NEW_CF_ACCOUNT_ID='416c8dfd48d7017aa7d3dc38412356ca';
  env.BUCKET='uploader'

  const pathSegments = (params.path || []) as String[];
  const path = decodeURIComponent(pathSegments.join("/"));
  const driveid = url.hostname.replace(/\..*/, "");

  return [env[driveid] || env["BUCKET"], path];
}