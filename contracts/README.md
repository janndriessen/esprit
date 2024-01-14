# GHOPAY - Smart Contracts
This directory contains the smart contracts related tests, utilities and deployment addresses for the Payment Settlement.

## How does it work ?
The smart contracts themselves have essentially three tasks:
1. Verify the user signature that was passed in by the Gelato relay in terms of amount and receiver
2. Use user signature to pull in GHO
3. Swap a fraction of the GHO for gas fee token (usually eth / native token) expected by relay
4. Pay the relay
5. Transfer remaining Gho to the receiver


## Installation
`yarn install`

## Run tests
`yarn test`


## Sepolia Deployment

### Warning:
Note that on Sepolia we have deployed the [PaymentSettlementTestHarness](contracts/contracts/test/PaymentSettlementTestHarness.sol) contract which extends the [PaymentSettlement](contracts/contracts/PaymentSettlement.sol) with some unsafe methods added for testing purposes.
One should NEVER deploy this version of the contract on a network were it will handle actual value.


### Run Deploy:
Delete deployment outputs of previous deployment if you want to redeploy:
`rm -rf deployments/sepolia`

Deploy on actual sepolia:
`deploy:sepolia --network sepolia`

Test deploy on local fork:
`deploy:sepolia --network localhost`

## Send Payment (on Sepolia)

You can use the [payment script](contracts/scripts/sendPayment.ts) to send a GHO payment gaslessly via the Gelato relay.
For this you will have to:
1. Adjust the `receiver` and `amount` variables in the script to your liking
2. Make sure you have set the `SEPOLIA_PRIVATE_KEY` environment variable to the private key of an account with sufficient GHO tokens on sepolia
3. Run `yarn send-payment:sepolia` to make the payment
4. Wait for the script to finish. In the success case the last emitted logs should llook something like this:
```
Task Status {
  chainId: 11155111,
  taskId: '0xaa31e9ec7dc88958e8d263b59575b2c22452985815552c4e189baa11e7141104',
  taskState: 'ExecSuccess',
  creationDate: '2024-01-14T06:51:54.367Z',
  transactionHash: '0xa38b90e8af1f66425961e3e09deca5bc184b94cf10be95535893338ce7dcf1c9',
  executionDate: '2024-01-14T06:52:01.839Z',
  blockNumber: 5083156,
  gasUsed: '295101',
  effectiveGasPrice: '153284042'
}
```



