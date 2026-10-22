import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
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
            LICENSE_SERVER_URL: 'https://maestro.test',
            LICENSE_PRODUCT: 'wa-connector',
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
