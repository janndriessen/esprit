# ESPRIT

Submission for [LFGHO](https://ethglobal.com/events/lfgho) - ETHGlobal 2024

<img src="https://github.com/janndriessen/ghopay/assets/2104965/92ec1949-c148-4eed-86a5-9a281c4feced" width="100" height="100" />

<hr />

The `consumer` uses the Esprit app to pay with GHO in any online shop integrating our solution.

The `merchant` can use our WooCommerce plug-in or for other online shops systems integrate the react component into his payment flow. With the dashboard they can check their incoming payments and off-ramp funds.

<hr />

## Deployments

Customer App: https://payment-app-cyan.vercel.app/

## Setup

### /contracts

For setup instructions, check the [contracts README](/contracts/README.md)

### /payment_app

This is the consumer app that is used for payments.

```
cp .env.default cp .env.local

yarn

yarn dev

```

The development version of the app runs on port 4000: http://localhost:4000

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
