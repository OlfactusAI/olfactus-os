import "server-only";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets =
  new Map<
    string,
    Bucket
  >();

export function checkRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now =
    Date.now();
  const current =
    buckets.get(key);

  if (
    !current ||
    current.resetAt <=
      now
  ) {
    buckets.set(key, {
      count: 1,
      resetAt:
        now + windowMs,
    });
    return {
      allowed: true,
      remaining:
        limit - 1,
      resetAt:
        now + windowMs,
    };
  }

  current.count += 1;
  buckets.set(
    key,
    current,
  );

  return {
    allowed:
      current.count <=
      limit,
    remaining:
      Math.max(
        0,
        limit -
          current.count,
      ),
    resetAt:
      current.resetAt,
  };
}

export function requestIdentity(
  request: Request,
) {
  return (
    request.headers.get(
      "x-forwarded-for",
    ) ??
    request.headers.get(
      "x-real-ip",
    ) ??
    "local"
  );
}
