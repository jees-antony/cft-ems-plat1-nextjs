# CFT Energy Dash

Full-stack Next.js energy monitoring dashboard that reads data from AWS DynamoDB.

## Quick Start

```bash
npm install
npm run dev
```

**Production mode:** The app connects to AWS DynamoDB using configured credentials. If credentials are not available, API endpoints return empty data and log errors to CloudWatch.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AWS_REGION` | `ap-south-1` | AWS region for DynamoDB |
| `DDB_TABLE` | `zoladyne-dash` | DynamoDB table name |
| `AWS_ACCESS_KEY_ID` | — | AWS access key (optional with IAM role) |
| `AWS_SECRET_ACCESS_KEY` | — | AWS secret key |


## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/energy?points=60` | GET | Time-series for charts (last N points) |
| `/api/energy/latest` | GET | Latest record |
| `/api/energy/history?start=&end=&limit=` | GET | Date range (YYYY-MM-DD) |
| `/api/energy/range?start=&end=` | GET | Timestamp range (ms) |
| `/api/health` | GET | Health check |

## DynamoDB Schema

- **PK**: `zoladyne/ems` (partition key)
- **SK**: Epoch milliseconds (sort key)
- **payload**: Map with `load`, `in`, `battery_voltage`, `KWH`, `data_1`, `data_2`, `data_3`, `time`, etc.

## Project Structure

```
app/
  layout.tsx, page.tsx
  api/energy/route.ts, latest/, history/, range/
  api/health/route.ts
lib/
  dynamodb.ts
  energy/types.ts, solar-calc.ts, mappers.ts
components/
  PowerFlowDiagram, KpiCards, TrendChart, LiveParams
```
