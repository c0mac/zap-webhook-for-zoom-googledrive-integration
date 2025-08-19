# Zoom Google Drive Webhook API

A Node.js webhook endpoint for Zapier integration with Zoom and Google Drive.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment:

   ```bash
   cp env.example .env
   ```

3. Start server:
   ```bash
   npm run dev
   ```

## Webhook Endpoint

**POST /webhook**

Accepts the parameters from your Zapier configuration:

- `user_id` - User identifier
- `from` - Start date/time (ISO format)
- `to` - End date/time (ISO format)
- `access_token` - Authentication token

## Testing

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "4mib83KLTqiLlyR4xDdU2g",
    "from": "2025-08-18T14:09:16+0000",
    "to": "2025-08-19T14:09:16+0000",
    "access_token": "eyJzdil6ljAwMDA..."
  }'
```

## Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel:

1. **Install Vercel CLI** (optional):

   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:

   ```bash
   vercel
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

3. **Environment Variables**: Set your environment variables in the Vercel dashboard:

   - Go to your project settings
   - Add any required environment variables from your `.env` file

4. **Webhook URL**: After deployment, your webhook will be available at:
   ```
   https://your-project-name.vercel.app/webhook
   ```

### Local Development

```bash
npm run dev
```

## Next Steps

Add your business logic in the TODO section of `server.js`:

- Validate access token
- Fetch Zoom data
- Process for Google Drive
