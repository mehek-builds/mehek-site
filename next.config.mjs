/** @type {import('next').NextConfig} */
const nextConfig = {
  // Baked once here at `next build` time, so the server-rendered HTML and the
  // client hydration pass agree (both read the same inlined env value)
  // instead of each calling `new Date()` against a different real clock.
  env: {
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10),
  },
};

export default nextConfig;
