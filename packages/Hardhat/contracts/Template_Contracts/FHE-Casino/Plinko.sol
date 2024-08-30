// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "fhevm/lib/TFHE.sol";

contract Plinko is Ownable {
    using SafeERC20 for IERC20;
    address public betTokenAddress;
    bool public isInitialised;
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

    event Plinko_Outcome_Event(
        address indexed playerAddress,
        uint256 wager,
        uint256 payout,
        address tokenAddress,
        uint8[8] randomBits,
        uint256 spinPayout
    );

    function PLINKO_PLAY(uint256 wager) external {
        address msgSender = msg.sender;
        _transferWager(wager, msgSender);

        settleBet(wager, msgSender);
    }

    function settleBet(uint256 wager, address playerAddress) internal {
        require(playerAddress != address(0), "Invalid player address");
        address tokenAddress = betTokenAddress;
        uint8[8] memory randomBits = generate8RandomBits();
        uint256 spinPayout = calculatePlinkoPayout(wager, randomBits);

        emit Plinko_Outcome_Event(
            playerAddress,
            wager,
            spinPayout,
            tokenAddress,
            randomBits,
            spinPayout
        );

        if (spinPayout != 0) {
            _transferPayout(playerAddress, spinPayout);
        }
    }

    function generate8RandomBits() internal view returns (uint8[8] memory) {
        uint8 randomNumber = TFHE.decrypt(TFHE.randEuint8());
        uint8[8] memory randomBits;

        for (uint8 i = 0; i < 8; i++) {
            randomBits[i] = (randomNumber >> i) & 1;
        }

        return randomBits;
    }

    function calculatePlinkoPayout(
        uint256 wager,
        uint8[8] memory directions
    ) internal returns (uint256) {
        int8 position = 0;

        // Calculate final position based on directions
        for (uint8 i = 0; i < 8; i++) {
            if (directions[i] == 1) {
                position += 1;
            } else {
                position -= 1;
            }
        }
        counter++;
        if (position == -8 || position == 8) {
            return wager * 16;
        } else if (position == -7 || position == 7) {
            return wager * 8;
        } else if (position == -6 || position == 6) {
            return wager * 4;
        } else if (position == -5 || position == 5) {
            return wager * 2;
        } else if (position == -4 || position == 4) {
            return (wager * 1);
        } else if (position == -3 || position == 3) {
            return (wager * 1) / 2;
        } else if (position == -2 || position == 2) {
            return (wager * 1) / 4;
        } else if (position == -1 || position == 1) {
            return (wager * 1) / 8;
        } else {
            return (wager * 1) / 16;
        }
    }
}