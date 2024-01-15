// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {
    GelatoRelayContext
} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "./interfaces/IUniV3Pool.sol";
import "./interfaces/IWETH.sol";


contract PaymentSettlement is GelatoRelayContext, EIP712, Ownable, Pausable {

    using SafeERC20 for IERC20;

    // Copied from: https://github.com/Uniswap/v3-core/blob/d8b1c635c275d2a9450bd6a78f3fa2484fef73eb/contracts/libraries/TickMath.sol#L13
    /// @dev The minimum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MIN_TICK)
    uint160 internal constant MIN_SQRT_RATIO = 4295128739;
    /// @dev The maximum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MAX_TICK)
    uint160 internal constant MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342;

    bytes32 public constant PAY_TYPEHASH =
        keccak256("Pay(address receiver,uint256 permitNonce)");

    IUniV3Pool internal immutable uniV3Pool;
    IWETH public immutable weth;
    
    address internal constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address internal allowedCallback;

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }
    struct PermitData {
        uint256 deadline;
        Signature signature;
    }

    struct PaymentData {
        address token;
        address from;
        address to;
        uint256 amount;
        PermitData permitData;
    }

    event Payment(
        address indexed token,
        address indexed from,
        address indexed to,
        uint256 amount
    );

    modifier checkCallback() {
        require(msg.sender == allowedCallback, "AuctionBot: msg.sender != allowedCallback");
        _;
        allowedCallback = address(0);
    }

    constructor(address payable _uniV3Pool, address payable _weth) EIP712("PaymentSettlement", "1") {
        uniV3Pool = IUniV3Pool(_uniV3Pool);
        weth = IWETH(_weth);
    }

    function pay(
        PaymentData calldata _paymentData,
        Signature calldata _signature
    ) external whenNotPaused onlyGelatoRelay {
        address feeToken = address(_getFeeToken());
        uint256 fee = _getFee();
        _settlePayment(_paymentData, _signature, feeToken, fee);
    }

    // This function is used to verify the data and revert the transaction
    // Only call as static call to avoid wasting gas
    function verifyData(
        PaymentData calldata _paymentData,
        Signature calldata _signature,
        address _feeToken,
        uint256 _fee
    ) external whenNotPaused returns (bool) {

        try this.verifyDataReverting(_paymentData, _signature, _feeToken, _fee) {
            revert("PaymentSettlement: verifyDataReverting did not revert");
        } catch Error(string memory reason) {
            // Check that the right error was thrown
            if (keccak256(abi.encodePacked(reason)) != keccak256(abi.encodePacked("PaymentSettlement: verification complete"))) {
                return(false);
            }
        } catch {
           return (false);
        }

        return(true);
    }

    // This function is used to verify the data and revert the transaction
    // This will always revert and is only meant to be called by verifyData
    function verifyDataReverting(
        PaymentData calldata _paymentData,
        Signature calldata _signature,
        address _feeToken,
        uint256 _fee
    ) external {
        _settlePayment(_paymentData, _signature, _feeToken, _fee);
        revert("PaymentSettlement: verification complete");
    }


    function verifySignature(
        PaymentData calldata _paymentData,
        Signature calldata _signature
    ) external view returns (bool) {
        bool result = _verifySignature(_paymentData, _signature);
        return result;
    }

    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() external onlyOwner whenPaused {
        _unpause();
    }

    function transferOwner(address _newOwner) external onlyOwner {
        _transferOwnership(_newOwner);
    }

    // @dev Called by UniswapV3Pool after a swap
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes memory data
    ) external checkCallback {
        (address paymentToken) = abi.decode(data, (address));
        uint256  amountToRepay = amount1Delta > 0 ? uint256(amount1Delta) : uint256(amount0Delta);
        IERC20(paymentToken).safeTransfer(msg.sender, amountToRepay);
    }

    // ====== INTERNAL FUNCTIONS ======

    function _settlePayment(
        PaymentData calldata _paymentData,
        Signature calldata _signature,
        address _feeToken,
        uint256 _fee
    ) internal {

        require(_verifySignature(_paymentData, _signature), "PaymentSettlement: invalid signature");

        IERC20Permit(_paymentData.token).permit(
            _paymentData.from,
            address(this),
            _paymentData.amount,
            _paymentData.permitData.deadline,
            _paymentData.permitData.signature.v,
            _paymentData.permitData.signature.r,
            _paymentData.permitData.signature.s
        );

        IERC20(_paymentData.token).safeTransferFrom(
            _paymentData.from,
            address(this),
            _paymentData.amount
        );

        _obtainFeeToken(_paymentData.token, _paymentData.amount, _feeToken, _fee);
        _transferRelayFee();

        SafeERC20.safeTransfer(
            IERC20(_paymentData.token),
            _paymentData.to,
            IERC20(_paymentData.token).balanceOf(address(this))
        );

        emit Payment(
            _paymentData.token,
            _paymentData.from,
            _paymentData.to,
            _paymentData.amount
        );

    }


    function _obtainFeeToken(
        address _paymentToken,
        uint256 _paymentAmount,
        address _feeToken,
        uint256 _fee
    ) internal {
        if(_feeToken == _paymentToken) {
            return;
        }

        bool isFeeTokenETH = _feeToken == ETH;
        if(isFeeTokenETH) {
            _feeToken = address(weth);
        }

        IUniV3Pool uniV3Pool = _getUniV3Pool();
        IERC20(_paymentToken).approve(address(uniV3Pool), _paymentAmount);

        bool zeroForOne = uniV3Pool.token0() == _paymentToken;
        int256 amountSpecified = -int256(_fee);
        uint160 sqrtPriceLimitX96 = 0;
        allowedCallback = address(uniV3Pool);
        uniV3Pool.swap(
            address(this),
            zeroForOne,
            amountSpecified,
            zeroForOne ? MIN_SQRT_RATIO + 1 : MAX_SQRT_RATIO - 1,
            abi.encode(_paymentToken)
        );

        if(isFeeTokenETH) {
            weth.withdraw(_fee);
        }
    }

    function _verifySignature(
        PaymentData calldata _paymentData,
        Signature calldata _signature
    ) internal view  returns(bool) {
        uint256 userNonce = IERC20Permit(_paymentData.token).nonces(_paymentData.from);

        bytes32 paymentStructHash = keccak256(abi.encode(
            PAY_TYPEHASH,
            _paymentData.to,
            userNonce
        ));
        bytes32 hash = _hashTypedDataV4(paymentStructHash);
        address signer = ECDSA.recover(hash, _signature.v, _signature.r, _signature.s);
        bool result = signer == _paymentData.from;
        return(result);
    }

    function _getUniV3Pool() internal virtual view returns(IUniV3Pool) {
        return(uniV3Pool);
    }

    receive() external payable {
        require(msg.sender == address(weth), "PaymentSettlement: invalid msg.sender");
    }

}
