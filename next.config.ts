import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
  
};

export default withSentryConfig(nextConfig, {
  org: "signa-labs-inc",
  project: "javascript-nextjs",
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
});
