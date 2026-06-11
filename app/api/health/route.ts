import { NextResponse } from 'next/server';

/**
 * Liveness/readiness probe for container orchestrators (App Runner
 * health checks, ECS/ALB target-group checks, Kubernetes probes).
 *
 * Always served fresh so a cached 200 can never mask an unhealthy
 * instance. Returns the build version (the commit SHA or release tag
 * baked in at image build time) to confirm which build a given
 * environment is serving.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return NextResponse.json({
    status: 'ok',
    version:
      process.env.APP_VERSION ?? process.env.npm_package_version ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
}
