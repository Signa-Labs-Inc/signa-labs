FROM node:20-slim

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support

WORKDIR /workspace

# Install dependencies locally so Vite/ESM resolution works correctly
RUN npm init -y && npm install --save-dev \
  vitest@^3.0.0 \
  tsx \
  express@^5.0.0 \
  supertest@^7.0.0 \
  @types/express@^5.0.0 \
  @types/supertest@^6.0.0

# Copy the test runner and vitest config
COPY run_tests.mjs /usr/local/bin/run_tests.mjs
COPY vitest.config.mjs /workspace/vitest.config.mjs

RUN chmod +x /usr/local/bin/run_tests.mjs

RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace
USER runner

ENTRYPOINT ["node", "/usr/local/bin/run_tests.mjs"]
