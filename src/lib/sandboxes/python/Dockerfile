FROM python:3.12-slim

# Install pytest and common testing utilities
RUN pip install --no-cache-dir pytest pytest-json-report pytest-timeout

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support

# Copy the test runner entrypoint
COPY run_tests.py /usr/local/bin/run_tests.py
RUN chmod +x /usr/local/bin/run_tests.py

# Set working directory
WORKDIR /workspace

# Run as non-root for security
RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace
USER runner

ENTRYPOINT ["python", "/usr/local/bin/run_tests.py"]