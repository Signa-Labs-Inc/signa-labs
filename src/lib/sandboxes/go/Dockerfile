FROM golang:1.23-bookworm

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support

# Copy the test runner entrypoint
COPY run_tests.sh /usr/local/bin/run_tests.sh
RUN chmod +x /usr/local/bin/run_tests.sh

WORKDIR /workspace

RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace
USER runner

ENTRYPOINT ["/usr/local/bin/run_tests.sh"]