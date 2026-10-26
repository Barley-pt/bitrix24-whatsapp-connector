import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        // No `r2Buckets` binding here, on purpose. vitest-pool-workers's isolated storage pushes
        // and pops a stack frame per suite by copying every file under each storage directory and
        // asserting each one ends in ".sqlite" - and workerd leaves R2's `*.sqlite-shm` behind as
        // soon as the bucket is written to, so any suite touching a real bucket dies at the pop
        // with "Expected .sqlite". (Turning isolated storage off instead makes every test file its
        // own worker, which miniflare rejects with ERR_MULTIPLE_CONSUMERS for the queue bindings
        // below.) So AUDIO_STAGING is not bound: specs that need it swap in the in-memory bucket
        // from test/helpers.ts (installFakeR2), which implements exactly the subset media.ts uses.
        // D1 and the queues keep running on real miniflare services.
        miniflare: {
          compatibilityDate: '2026-08-01',
          // Required by the test pool itself, not by the Worker.
          // service_binding_extra_handlers is required to call `worker.queue()` directly in
          // tests (see test/inbound.spec.ts) - experimental, Cloudflare-docs-confirmed, and
          // rejected outside test/dev, so it cannot leak into the deployed compatibility_date.
          compatibilityFlags: ['nodejs_compat', 'service_binding_extra_handlers'],
          d1Databases: { DB: 'test-db' },
          queueProducers: {
            INBOUND_QUEUE: 'bwac-inbound',
            OUTBOUND_QUEUE: 'bwac-outbound',
          },
          queueConsumers: {
            'bwac-inbound': { maxBatchTimeout: 0.05 },
            'bwac-inbound-dlq': { maxBatchTimeout: 0.05 },
            'bwac-outbound': { maxBatchTimeout: 0.05 },
            'bwac-outbound-dlq': { maxBatchTimeout: 0.05 },
          },
          bindings: {
            PUBLIC_URL: 'https://relay.test',
            CONNECTOR_ID: 'whatsapp_connector',
            CONNECTOR_NAME: 'WhatsApp',
            CONNECTOR_VERSION: '1',
            APP_VERSION: '0.1.0-test',
            BITRIX_CLIENT_ID: 'local.test',
            BITRIX_CLIENT_SECRET: 'test-client-secret',
            APP_SECRET: 'test-app-secret',
            // base64 of 32 bytes
            TOKEN_ENC_KEY: 'K5xN2vQ8sYb1mZ3pR7tW9cF4hJ6kL0nA2dG5jH8uP1s=',
            LICENSE_SERVER_URL: 'https://license.test',
            LICENSE_PRODUCT: 'wa-connector',
            // Deliberately not a real key: it imports as null, so anything signed by it fails
            // closed. Tests that need a verifiable license sign a fixture at test time with a
            // per-test Ed25519 keypair and swap this binding for that key (test/helpers.ts).
            LICENSE_PUBLIC_KEY: 'test-public-key',
            LICENSE_ENFORCE: 'false',
            WASENDER_BASE_URL: 'https://wasender.test',
            WASENDER_MASTER_TOKEN: 'test-master-token',
            ADMIN_SECRET: 'test-admin-secret',
            EDGE_SECRET: 'test-edge-secret',
          },
        },
      },
    },
  },
});
