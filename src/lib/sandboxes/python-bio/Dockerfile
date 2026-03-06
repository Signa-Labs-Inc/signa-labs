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
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support

COPY run_tests.py /usr/local/bin/run_tests.py
RUN chmod +x /usr/local/bin/run_tests.py

WORKDIR /workspace

RUN useradd --create-home --shell /bin/bash runner
USER runner

ENTRYPOINT ["python", "/usr/local/bin/run_tests.py"]