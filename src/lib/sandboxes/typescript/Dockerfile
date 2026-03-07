FROM node:20-slim

# Create workspace and sandbox directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support /opt/sandbox

# Install dependencies in /opt/sandbox (outside /workspace to avoid Fly tmpfs masking)
WORKDIR /opt/sandbox
RUN npm init -y && npm install --save-dev vitest@^3.0.0 tsx

# Copy the test runner entrypoint, vitest config, and HTTP wrapper
COPY typescript/run_tests.mjs /usr/local/bin/run_tests.mjs
COPY typescript/vitest.config.mjs /opt/sandbox/vitest.config.mjs
COPY shared/http-wrapper.cjs /opt/sandbox/http-wrapper.cjs

RUN chmod +x /usr/local/bin/run_tests.mjs

# Make vitest binary and node_modules available from /opt/sandbox
ENV PATH="/opt/sandbox/node_modules/.bin:$PATH"
ENV NODE_PATH="/opt/sandbox/node_modules"

WORKDIR /workspace

# Symlink node_modules so Vite's resolver finds packages when walking up from /workspace/tests/
RUN ln -s /opt/sandbox/node_modules /workspace/node_modules

# Run as non-root for security
RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace /opt/sandbox
USER runner

ENV TEST_RUNNER=/usr/local/bin/run_tests.mjs
EXPOSE 8080

CMD ["node", "/opt/sandbox/http-wrapper.cjs"]