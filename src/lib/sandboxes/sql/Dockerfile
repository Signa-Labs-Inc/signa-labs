FROM python:3.12-slim

# SQLite comes bundled with Python's standard library.
# We use pytest to run tests that execute SQL against an in-memory SQLite database.
RUN pip install --no-cache-dir \
  pytest \
  pytest-json-report \
  pytest-timeout

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support

COPY run_tests.py /usr/local/bin/run_tests.py
RUN chmod +x /usr/local/bin/run_tests.py

WORKDIR /workspace

RUN useradd --create-home --shell /bin/bash runner
USER runner

ENTRYPOINT ["python", "/usr/local/bin/run_tests.py"]