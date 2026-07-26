import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The scene plates are pre-encoded WebP carrying fine gradient linework.
    // Next re-encodes on the way out, and its default of 75 visibly mushes the
    // wireframe piece, so 90 has to be declared here for <Image quality={90}>
    // to be honoured at all.
    qualities: [75, 90],
    // Cap the ladder at 2560. The plates are 4K masters, but a full 3840
    // variant of the wireframe piece costs 1.1 MB against 400 KB at 2560, and
    // it sits behind scrims at 25-100% opacity. Capping here rather than via
    // `sizes` is deliberate — `sizes` is multiplied by device pixel ratio, so a
    // retina laptop would still ask for 3840.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],
  },
};

export default nextConfig;
