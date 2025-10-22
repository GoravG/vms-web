# VMS Web Frontend

A Next.js-based frontend application that connects to a WebSocket backend for real-time updates. This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Features

- Real-time WebSocket connection
- QR Code generation
- Connection status indicators
- Automatic reconnection on disconnect
- Docker support

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional)

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_BASE_URL=localhost:8080
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Docker Deployment

### Using Docker

1. Build the Docker image:
```bash
docker build -t vms-web .
```

2. Run the container:
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_BASE_URL=your-backend-url vms-web
```

### Environment Variables

- `NEXT_PUBLIC_BASE_URL`: WebSocket backend server URL (e.g., `localhost:8080`)

You can override environment variables in Docker using:
- Direct in docker-compose.yml
- Using .env file with variable substitution
- Using env_file directive
- Command line: `BACKEND_URL=production-server:8080 docker-compose up`

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
