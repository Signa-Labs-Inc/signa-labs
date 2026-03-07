FROM python:3.12-slim

# Install pytest and common testing utilities
RUN pip install --no-cache-dir pytest pytest-json-report pytest-timeout

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support /opt/sandbox

# Copy the test runner entrypoint
COPY python/run_tests.py /usr/local/bin/run_tests.py
COPY shared/http-wrapper.py /opt/sandbox/http-wrapper.py
RUN chmod +x /usr/local/bin/run_tests.py

# Set working directory
WORKDIR /workspace

# Run as non-root for security
RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace /opt/sandbox
USER runner

ENV TEST_RUNNER=/usr/local/bin/run_tests.py
EXPOSE 8080

CMD ["python", "/opt/sandbox/http-wrapper.py"]