# Dockerfile for Hugo development
FROM hugomods/hugo:exts

# Set working directory
WORKDIR /src

# Expose Hugo server port
EXPOSE 1313

# Run Hugo server
CMD ["hugo", "server", "--bind", "0.0.0.0", "--buildDrafts", "--buildFuture", "--disableFastRender"]
