# simple static server

A simple server for serving static files that allow you to upload files.

## Features

- Basic auth for upload file
- Serve/download files
- A cron job to create/delete(if passed one month) folders every day at 00:00

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
docker run --rm -it -p 4000:3000 -e BASIC_AUTH_USERNAME=admin -e BASIC_AUTH_PASSWORD=password -v /Volumes/Shared:/app/static simple-static-server
# For production
docker run -d --name simple-static-server --restart always -p 4000:3000 -e BASIC_AUTH_USERNAME=admin -e BASIC_AUTH_PASSWORD=password -v /Volumes/Shared:/app/static simple-static-server
```

## TODO

- [ ] Add schedule to delete old files
- [ ] Add summary statistics information
