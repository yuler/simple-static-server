# API Documentation

This document describes the available API endpoints for file upload, download, and static file serving.

## Static File Serving

All files in the <`static`> directory are served under the `/file` path.

**Example:**

GET http://localhost:3000/file/1.txt

## File Upload

### Upload via FormData

Upload a file using multipart/form-data.

**Endpoint:** `POST /upload`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Authorization: `Basic base64(<username>:<password>)`
- Body: Form data with a file field named "file"

**Example:**
```bash
curl -X POST -F "file=@README.md" -H "Authorization: Basic $(echo -n "admin:password" | base64)" http://localhost:3000/upload
```

**Response:**
```json
{
  "filename": "example.txt",
  "url": "/file/YYYY-MM-DD/example.txt"
}
```

### Upload via Base64

Upload a file using base64-encoded data.

**Endpoint:** `POST /upload`

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Authorization: `Basic base64(<username>:<password>)`
- Body:
  ```json
  {
    "base64": "SGVsbG8gV29ybGQ=",
    "filename": "example.txt"
  }
  ```

**Example:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n "admin:password" | base64)" \
  -d '{"base64":"SGVsbG8gV29ybGQ=","filename":"test.txt"}' \
  http://localhost:3000/upload/base64
```

**Response:**
```json
{
  "filename": "example.txt",
  "url": "/file/YYYY-MM-DD/example.txt"
}
```

## File Download

Download a file with proper headers for browser download.

**Endpoint:** `GET /download/:filepath`
**Endpoint:** `GET /download?filepath=<filepath>`

**Parameters:**
- `filepath`: Path to the file to download

**Example:**
```bash
curl http://localhost:3000/download/1.txt -O
curl http://localhost:3000/download?filepath=1.txt -O
```

**Response:**
- Success: File content with appropriate headers
  - Content-Disposition: `attachment; filename="example.txt"`
  - Content-Type: `application/octet-stream`
- Error (404):
  ```json
  {
    "error": "File not found"
  }
  ```

## Error Responses

All endpoints may return the following error responses:

- 400 Bad Request: When required parameters are missing or invalid
- 404 Not Found: When requested file doesn't exist
```

This documentation provides a clear overview of all available endpoints, including:
- Static file serving
- Two methods for file upload (FormData and Base64)
- File download functionality
- Example requests using curl
- Expected responses and error cases

Users can refer to this documentation to understand how to interact with your API endpoints.
