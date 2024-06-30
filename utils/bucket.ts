const bucketName = "uploader"; 

export function parseBucketPath(context: any): [any, string] {
  const { request, env, params } = context;
  const url = new URL(request.url);

  const pathSegments = (params.path || []) as string[];
  const path = decodeURIComponent(pathSegments.join("/"));
  const driveId = url.hostname.replace(/\..*/, "");

  return [bucketName, path];
}