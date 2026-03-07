FROM golang:1.23-bookworm

# Install python3 for JSON parsing in test runner and HTTP wrapper
RUN apt-get update && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support /opt/sandbox

# Copy the test runner entrypoint
COPY go/run_tests.sh /usr/local/bin/run_tests.sh
COPY shared/http-wrapper.py /opt/sandbox/http-wrapper.py
RUN chmod +x /usr/local/bin/run_tests.sh

WORKDIR /workspace

RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace /opt/sandbox
USER runner

ENV TEST_RUNNER=/usr/local/bin/run_tests.sh
EXPOSE 8080

CMD ["python3", "/opt/sandbox/http-wrapper.py"]