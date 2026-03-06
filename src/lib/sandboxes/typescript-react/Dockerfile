FROM node:20.20.1-slim

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support

WORKDIR /workspace

# Install dependencies locally so Vite/ESM resolution works correctly
RUN npm init -y && npm install --save-dev \
  vitest@^3.0.0 \
  tsx \
  react@^19.0.0 \
  react-dom@^19.0.0 \
  @testing-library/react@^16.0.0 \
  @testing-library/jest-dom@^6.0.0 \
  @testing-library/user-event@^14.0.0 \
  jsdom@^25.0.0 \
  @types/react@^19.0.0 \
  @types/react-dom@^19.0.0

# Copy the test runner and vitest config
COPY run_tests.mjs /usr/local/bin/run_tests.mjs
COPY vitest.config.mjs /workspace/vitest.config.mjs

RUN chmod +x /usr/local/bin/run_tests.mjs

RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace
USER runner

ENTRYPOINT ["node", "/usr/local/bin/run_tests.mjs"]
