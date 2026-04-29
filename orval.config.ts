import { defineConfig } from 'orval'

const orvalInputTarget =
  (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.ORVAL_INPUT_TARGET ?? 'http://localhost:3000/api-docs-json'

export default defineConfig({
  pluto: {
    input: {
      target: orvalInputTarget,
    },
    output: {
      target: 'src/lib/api/generated/endpoints.ts',
      schemas: 'src/lib/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      mode: 'tags-split',
      clean: true,
      override: {
        mutator: {
          path: './src/lib/api/orval-mutator.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
})
