# ESPRIT 👻

Submission for [LFGHO](https://ethglobal.com/events/lfgho) - ETHGlobal 2024

The `consumer` uses the Esprit app to pay with GHO in any online shop integrating our solution.

The `merchant` can use our WooCommerce plug-in or for other online shops systems integrate the react component into his payment flow. With the dashboard they can check their incoming payments and off-ramp funds.

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

Demo of the react component integration: http://localhost:3000/payment

Merchant dashboard: http://localhost:3000/dashboard
