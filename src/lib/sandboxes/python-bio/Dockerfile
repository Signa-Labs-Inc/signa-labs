FROM python:3.14-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
  gcc \
  g++ \
  && rm -rf /var/lib/apt/lists/*

# Install bioinformatics stack
RUN pip install --no-cache-dir \
  pytest \
  pytest-json-report \
  pytest-timeout \
  numpy \
  pandas \
  biopython

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support /opt/sandbox

COPY python-bio/run_tests.py /usr/local/bin/run_tests.py
COPY shared/http-wrapper.py /opt/sandbox/http-wrapper.py
RUN chmod +x /usr/local/bin/run_tests.py

WORKDIR /workspace

RUN useradd --create-home --shell /bin/bash runner && \
    chown -R runner:runner /workspace /opt/sandbox
USER runner

ENV TEST_RUNNER=/usr/local/bin/run_tests.py
EXPOSE 8080

CMD ["python", "/opt/sandbox/http-wrapper.py"]