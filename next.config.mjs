// 1. ESM file name: `next.config.mjs`
// 2. Top-level `await import` works in ESM

let userConfig = {}

try {
  // 3. Handle default exports from the user config:
  const imported = await import('./v0-user-next.config.mjs')
  userConfig = imported.default ?? {}
} catch (error) {
  // If file doesn't exist or there's another error, you can log or ignore
  console.warn('[Next Config] No user config found or failed to import. Skipping user config.')
}

/** @type {import('next').NextConfig} */
const baseConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}

// 4. Shallow merge user config into base config:
const finalConfig = mergeConfig(baseConfig, userConfig)

// Export the merged config as default
export default finalConfig

function mergeConfig(base, overrides) {
  if (!overrides) return base

  for (const key in overrides) {
    // If the base key is an object (not array), shallow-merge
    if (base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      base[key] = {
        ...base[key],
        ...overrides[key],
      }
    } else {
      // Otherwise overwrite completely
      base[key] = overrides[key]
    }
  }
  return base
}
