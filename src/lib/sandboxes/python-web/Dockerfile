FROM python:3.12-slim

# Install pytest + web frameworks + testing utilities
RUN pip install --no-cache-dir \
  pytest \
  pytest-json-report \
  pytest-timeout \
  flask \
  fastapi \
  httpx \
  uvicorn

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support

COPY run_tests.py /usr/local/bin/run_tests.py
RUN chmod +x /usr/local/bin/run_tests.py

WORKDIR /workspace

RUN useradd --create-home --shell /bin/bash runner
USER runner

ENTRYPOINT ["python", "/usr/local/bin/run_tests.py"]