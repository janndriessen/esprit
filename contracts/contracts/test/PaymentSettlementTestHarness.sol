// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "../PaymentSettlement.sol";


contract PaymentSettlementTestHarness is PaymentSettlement {
    constructor(address payable _uniV3Router, address payable _weth) PaymentSettlement(_uniV3Router, _weth) {}

    function payTest(
        PaymentData calldata _paymentData,
        Signature calldata _signature,
        address _feeToken,
        uint256 _fee
    ) external whenNotPaused {
        _settlePayment(_paymentData, _signature, _feeToken, _fee);
    }
}
