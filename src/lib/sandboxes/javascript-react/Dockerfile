FROM node:20-slim

# Create workspace and sandbox directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support /opt/sandbox

# Install dependencies in /opt/sandbox (outside /workspace to avoid Fly tmpfs masking)
WORKDIR /opt/sandbox
RUN npm init -y && npm install --save-dev \
  vitest@^3.0.0 \
  react@^19.0.0 \
  react-dom@^19.0.0 \
  @testing-library/react@^16.0.0 \
  @testing-library/jest-dom@^6.0.0 \
  @testing-library/user-event@^14.0.0 \
  jsdom@^25.0.0

# Copy the test runner, vitest config, and HTTP wrapper
COPY javascript-react/run_tests.mjs /usr/local/bin/run_tests.mjs
COPY javascript-react/vitest.config.mjs /opt/sandbox/vitest.config.mjs
COPY shared/http-wrapper.cjs /opt/sandbox/http-wrapper.cjs

RUN chmod +x /usr/local/bin/run_tests.mjs

# Make vitest binary and node_modules available from /opt/sandbox
ENV PATH="/opt/sandbox/node_modules/.bin:$PATH"
ENV NODE_PATH="/opt/sandbox/node_modules"

WORKDIR /workspace

# Symlink node_modules so Vite's resolver finds packages when walking up from /workspace/tests/
RUN ln -s /opt/sandbox/node_modules /workspace/node_modules

RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace /opt/sandbox
USER runner

ENV TEST_RUNNER=/usr/local/bin/run_tests.mjs
EXPOSE 8080

CMD ["node", "/opt/sandbox/http-wrapper.cjs"]