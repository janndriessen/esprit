// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "../PaymentSettlement.sol";
import "../interfaces/IUniV3Router.sol";


contract PaymentSettlementTestHarness is PaymentSettlement {

    IUniV3Router internal uniV3RouterOverride;
    constructor(address payable _uniV3Router, address payable _weth) PaymentSettlement(_uniV3Router, _weth) {
        uniV3RouterOverride = IUniV3Router(_uniV3Router);
    } 

    function payTest(
        PaymentData calldata _paymentData,
        Signature calldata _signature,
        address _feeToken,
        uint256 _fee
    ) external whenNotPaused {
        _settlePayment(_paymentData, _signature, _feeToken, _fee);
    }

    function setUniV3Router(IUniV3Router _newRouter) external {
        uniV3RouterOverride = _newRouter;
    }

    function _getUniV3Router() internal override view returns(IUniV3Router) {
        return(uniV3RouterOverride);
    }
}
