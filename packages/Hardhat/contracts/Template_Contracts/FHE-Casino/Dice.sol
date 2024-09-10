// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "../../../contracts/gentry_libraries/TFHE.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dice is Ownable {
    using SafeERC20 for IERC20;
    address public betTokenAddress;

    error ZeroWager();

    bool public isInitialised;

    address public bankRoll;

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

    /**
     * @dev event emitted by the VRF callback with the bet results
     * @param playerAddress address of the player that made the bet
     * @param wager wager amount
     * @param payout total payout transfered to the player
     * @param tokenAddress address of token the wager was made and payout, 0 address is considered the native coin
     */
    event Dice_Outcome_Event(
        address indexed playerAddress,
        uint256 wager,
        uint256 payout,
        address tokenAddress,
        uint8 diceValue
    );

    function DICE_PLAY(uint8 playerGuess, bool isOver, uint256 wager) public {
        require(
            playerGuess > 0 && playerGuess < 100,
            "Guess must be between 0 and 100"
        );

        _transferWager(wager, msg.sender);

        // Generate a random number
        uint8 randomNumber = generateEncryptedRandomNumber() % 101;

        bool playerWins = (isOver && randomNumber > playerGuess) ||
            (!isOver && randomNumber < playerGuess);
        uint256 payout;

        if (playerWins) {
            uint256 probability = isOver ? 100 - playerGuess : playerGuess;
            payout = (((wager * 100) / probability) * (100 - 2)) / 100;
        }
        emit Dice_Outcome_Event(
            msg.sender,
            wager,
            payout,
            betTokenAddress,
            randomNumber
        );
        if (payout != 0) {
            _transferPayout(msg.sender, payout);
        }
    }

    function generateEncryptedRandomNumber() internal view returns (uint8) {
        return TFHE.decrypt(TFHE.randEuint8());
    }
}