import { defineConfig } from 'orval'

export default defineConfig({
  pluto: {
    input: {
      target:
        process?.env?.ORVAL_INPUT_TARGET ??
        'http://localhost:3000/api-docs-json',
    },
    output: {
      target: 'src/shared/api/generated/endpoints.ts',
      schemas: 'src/shared/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      mode: 'tags-split',
      clean: true,
      override: {
        mutator: {
          path: './src/shared/api/orval-mutator.ts',
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
