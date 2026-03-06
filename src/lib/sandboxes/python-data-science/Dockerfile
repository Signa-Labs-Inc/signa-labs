FROM python:3.12-slim

# Install system dependencies for scipy and matplotlib
RUN apt-get update && apt-get install -y --no-install-recommends \
  gcc \
  g++ \
  libfreetype6-dev \
  libpng-dev \
  && rm -rf /var/lib/apt/lists/*

# Install data science + ML + NLP stack
RUN pip install --no-cache-dir \
  pytest \
  pytest-json-report \
  pytest-timeout \
  numpy \
  pandas \
  scipy \
  matplotlib \
  scikit-learn \
  nltk

# Download common NLTK data (tokenizers, stopwords, etc.)
RUN python -c "import nltk; nltk.download('punkt_tab', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('averaged_perceptron_tagger_eng', quiet=True); nltk.download('wordnet', quiet=True)"

# Set matplotlib to non-interactive backend (no display needed)
ENV MPLBACKEND=Agg

# Create workspace directories
RUN mkdir -p /workspace/submission /workspace/tests /workspace/support

COPY run_tests.py /usr/local/bin/run_tests.py
RUN chmod +x /usr/local/bin/run_tests.py

WORKDIR /workspace

RUN useradd --create-home --shell /bin/bash runner
USER runner

ENTRYPOINT ["python", "/usr/local/bin/run_tests.py"]