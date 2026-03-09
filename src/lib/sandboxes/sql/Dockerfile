FROM python:3.14-slim

# SQLite comes bundled with Python's standard library.
# We use pytest to run tests that execute SQL against an in-memory SQLite database.
RUN pip install --no-cache-dir \
  pytest \
  pytest-json-report \
  pytest-timeout

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support /opt/sandbox

COPY sql/run_tests.py /usr/local/bin/run_tests.py
COPY shared/http-wrapper.py /opt/sandbox/http-wrapper.py
RUN chmod +x /usr/local/bin/run_tests.py

WORKDIR /workspace

RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace /opt/sandbox
USER runner

ENV TEST_RUNNER=/usr/local/bin/run_tests.py
EXPOSE 8080

CMD ["python", "/opt/sandbox/http-wrapper.py"]