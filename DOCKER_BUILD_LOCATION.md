# Docker Build Location (Required)

Use this exact app directory when building/running EZApp Docker.

## Correct path
`/Users/xrkr80hd/EZAPP - PWA - APPLICATION/next-pwa-app`

## Build + run
```bash
cd "/Users/xrkr80hd/EZAPP - PWA - APPLICATION/next-pwa-app"
docker compose up -d --build
```

## Stop
```bash
cd "/Users/xrkr80hd/EZAPP - PWA - APPLICATION/next-pwa-app"
docker compose down
```

## Verify correct container/port
```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
```
Expected running app container:
- `ezapp-pwa-app`
- port mapping: `0.0.0.0:3000->3000/tcp`

## Important
Do **not** build from other directories or old repos. Always use the path above.
