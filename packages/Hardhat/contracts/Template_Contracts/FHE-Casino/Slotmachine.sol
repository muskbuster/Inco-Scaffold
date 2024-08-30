// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "fhevm/lib/TFHE.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SlotMachine is Ownable {
    using SafeERC20 for IERC20;

    address public betTokenAddress;
    bool public isInitialised;
    euint8 private encryptedConstantRandomNumber;
    uint256 counter;
    error ZeroWager();

    constructor(address _tokenAddress) Ownable(msg.sender) {
        betTokenAddress = _tokenAddress;
    }

    function initialize() external onlyOwner {
        require(
            IERC20(betTokenAddress).transferFrom(
                msg.sender,
                address(this),
                100000 * 10 ** 18
            ),
            "Initial funding failed"
        );
        isInitialised = true;
    }

    function _transferWager(uint256 wager, address msgSender) internal {
        if (wager == 0) {
            revert ZeroWager();
        }
        IERC20(betTokenAddress).safeTransferFrom(
            msgSender,
            address(this),
            wager
        );
    }

    /**
     * @dev function to request bankroll to give payout to player
     * @param player address of the player
     * @param payout amount of payout to give
     */
    function _transferPayout(address player, uint256 payout) internal {
        IERC20(betTokenAddress).safeTransfer(player, payout);
    }

    event SlotMachine_Outcome_Event(
        address indexed playerAddress,
        uint256 wager,
        uint256 payout,
        address tokenAddress,
        uint8[3] spin,
        uint256 spinPayout
    );

    function SLOTMACHINE_PLAY(uint256 wager) external {
        address msgSender = msg.sender;
        _transferWager(wager, msgSender);

        settleBet(wager, msgSender);
    }

    function settleBet(uint256 wager, address playerAddress) internal {
        require(playerAddress != address(0), "Invalid player address");
        address tokenAddress = betTokenAddress;
        (
            uint8 number1,
            uint8 number2,
            uint8 number3
        ) = generateEncryptedRandomNumbers();

        uint256 spinPayout = calculatePayout(number1, number2, number3, wager);

        emit SlotMachine_Outcome_Event(
            playerAddress,
            wager,
            spinPayout,
            tokenAddress,
            [number1, number2, number3],
            spinPayout
        );

        if (spinPayout != 0) {
            _transferPayout(playerAddress, spinPayout);
        }
    }

    function calculatePayout(
        uint8 number1,
        uint8 number2,
        uint8 number3,
        uint256 betAmount
    ) internal pure returns (uint256) {
        if (number1 == 7 && number2 == 7 && number3 == 7) {
            return betAmount * 5;
        }
        if (number1 == number2 && number2 == number3) {
            return (betAmount * (number1 + 1) * 3) / 4;
        }
        if (
            (number1 == 7 && number2 == 7) ||
            (number1 == 7 && number2 == 7) ||
            (number1 == 7 && number3 == 7)
        ) {
            return (betAmount * 3) / 2;
        }
        if (
            (number1 + 1 == number2 && number2 + 1 == number3) ||
            (number1 >= 1 && number2 == number1 - 1 && number3 == number2 - 1)
        ) {
            return (betAmount * 2) / 3;
        }
        if (number1 == number2 || number1 == number3 || number2 == number3) {
            return (betAmount * 1) / 3;
        }
        return 0;
    }

    function generateEncryptedRandomNumbers()
        public
        returns (uint8, uint8, uint8)
    {
        uint8 randomNumber = TFHE.decrypt(TFHE.randEuint8());
        uint8 _randomNumber1 = randomNumber % 8;
        uint8 _randomNumber2 = uint8(
            (uint16(randomNumber) + uint16(block.timestamp % 128)) % 8
        );
        uint8 _randomNumber3 = uint8((block.timestamp - randomNumber) % 8);
        counter++;
        return (_randomNumber1, _randomNumber2, _randomNumber3);
    }

}