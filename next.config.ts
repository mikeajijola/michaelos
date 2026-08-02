import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
};

export default withEve(nextConfig);
