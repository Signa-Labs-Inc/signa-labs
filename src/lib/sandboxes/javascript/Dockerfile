FROM node:20-slim

# Install vitest and common testing utilities globally
RUN npm install -g vitest@^3.0.0

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support

# Copy the test runner entrypoint and vitest config
COPY run_tests.mjs /usr/local/bin/run_tests.mjs
COPY vitest.config.mjs /workspace/vitest.config.mjs

RUN chmod +x /usr/local/bin/run_tests.mjs

# Set working directory
WORKDIR /workspace

# Run as non-root for security
RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace
USER runner

ENTRYPOINT ["node", "/usr/local/bin/run_tests.mjs"]