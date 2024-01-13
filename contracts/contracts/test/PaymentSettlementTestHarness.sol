// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "../PaymentSettlement.sol";
import "../interfaces/IUniV3Pool.sol";


contract PaymentSettlementTestHarness is PaymentSettlement {

    IUniV3Pool internal uniV3PoolOverride;
    constructor(address payable _uniV3Pool, address payable _weth) PaymentSettlement(_uniV3Pool, _weth) {
        uniV3PoolOverride = IUniV3Pool(_uniV3Pool);
    } 

    function payTest(
        PaymentData calldata _paymentData,
        Signature calldata _signature,
        address _feeToken,
        uint256 _fee
    ) external whenNotPaused {
        _settlePayment(_paymentData, _signature, _feeToken, _fee);
    }

    function setUniV3Pool(IUniV3Pool _newPool) external {
        uniV3PoolOverride = _newPool;
    }

    function _getUniV3Pool() internal override view returns(IUniV3Pool) {
        return(uniV3PoolOverride);
    }
}
