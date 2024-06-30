const bucketName = "uploader"; 

export function notFound() {
  return new Response("Not found", { status: 404 });
}

export function parseBucketPath(context): [any, string] {
  const { request, env, params } = context;
  const url = new URL(request.url);

  const pathSegments = (params.path || []) as string[];
  const path = decodeURIComponent(pathSegments.join("/"));
  const driveId = url.hostname.replace(/\..*/, "");

  return [bucketName, path];
}
