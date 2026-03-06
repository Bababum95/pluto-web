/**
 * Base URL for API used in MSW handlers.
 * Must match vitest.config.ts test.env (VITE_API_BASE_URL + VITE_API_VERSION)
 * so that handlers match requests regardless of client module load order.
 */
export const TEST_API_BASE_URL = 'http://localhost'
export const TEST_API_VERSION = 'v1'
export const TEST_API_ROOT = `${TEST_API_BASE_URL}/${TEST_API_VERSION}/`
