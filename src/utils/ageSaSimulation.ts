/** Docker/yerel: URL yoksa veya api-sim / AGESA_SIMULATE ise gerçek HTTP çağrısı yapılmaz */
export function isAgeSaSimulationMode(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (env.AGESA_SIMULATE === 'true') return true;
  const url = env.AGESA_API_URL?.trim();
  if (!url) return true;
  return url.includes('api-sim');
}
