# simple static server

A simple server for serving static files that allow you to upload files.

## Features

- Serve static files
- Allow you to upload files
- Allow you to download files

## Development

```bash
pnpm install
pnpm run dev
```

Note: If you want specify the static directory, you can symlink the directory.

```bash
ln -s /Volumes/Shared/ "$PWD/static"
```

## Run in Docker

```bash
docker build --no-cache -t simple-static-server .
# For temporary
docker run --rm -it -p 4000:3000 -v /Volumes/Shared:/app/static simple-static-server
# For production
docker run -d --name simple-static-server --restart always -p 4000:3000 -v /Volumes/Shared:/app/static simple-static-server
```
