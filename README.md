# ESPRIT

Submission for [LFGHO](https://ethglobal.com/events/lfgho) - ETHGlobal 2024

## Setup

### /contracts

For setup instructions, check the [contracts README](/contracts/README.md)

### /shop

The shop application includes the payment online shop and merchant dashboard flow.
In a real world production version `/payment` would be our react component SDK
integrated into the online shop.

```
nvm current
v20.11.0 // make sure to use the latest node.js version

cp .env.default .env.local

npm install

npm run dev
```

React component online shop integration: http://localhost:3000/payment
Merchant dashboard: http://localhost:3000/dashboard
