FROM golang:1.26.9-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends python3 ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://nodejs.org/dist/v24.20.0/node-v24.20.0-linux-x64.tar.xz \
    | tar -xJ -C /usr/local --strip-components=1
