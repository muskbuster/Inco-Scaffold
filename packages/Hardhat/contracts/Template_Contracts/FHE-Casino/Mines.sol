// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../../../contracts/gentry_libraries/TFHE.sol";

contract Mines is Ownable {
    using SafeERC20 for IERC20;

    address public betTokenAddress;
    bool public isInitialised;
    uint256 public houseBalance;
    uint256 counter;

    modifier onlyWhenInitialised() {
        require(isInitialised, "Contract is not initialized");
        _;
    }

    constructor(address _tokenAddress) Ownable(msg.sender) {
        betTokenAddress = _tokenAddress;
    }

    function initialize() external onlyOwner {
        require(
            IERC20(betTokenAddress).transferFrom(
                msg.sender,
                address(this),
                100000 * 10**18
            ),
            "Initial funding failed"
        );
        isInitialised = true;
        houseBalance = 100000 * 10**18;
    }

    event MinesGameOutcome(
        address indexed playerAddress,
        uint256 wager,
        uint256 payout,
        address tokenAddress,
        uint8[2][] selectedPoints,
        uint8[2][] minePositions
    );

    function MINES_PLAY(
        uint8[2][] memory points,
        uint8 numMines,
        uint256 wager
    ) external onlyWhenInitialised {
        require(wager > 0, "Wager must be greater than zero");
        require(numMines > 0 && numMines <= 5, "Invalid number of mines");
        require(points.length <= 10, "Cannot select more than 10 points");

        for (uint8 i = 0; i < points.length; i++) {
            require(
                points[i][0] < 5 && points[i][1] < 5,
                "Invalid point coordinates"
            );
        }

        _transferWager(wager, msg.sender);
        settleBet(points, numMines, wager, msg.sender);
    }

    function settleBet(
        uint8[2][] memory points,
        uint8 numMines,
        uint256 wager,
        address playerAddress
    ) internal {
        require(playerAddress != address(0), "Invalid player address");

        uint32 random = uint32(TFHE.decrypt(TFHE.randEuint32()));
        uint8[2][] memory minePositions = new uint8[2][](numMines);

        for (uint8 i = 0; i < numMines; i++) {
            uint8 randValue1 = uint8(((random >> (i * 5)) & 0x3F) % 5); // Extract 6 bits and take modulo 5
            uint8 randValue2 = uint8(((random >> ((i * 5) + 3)) & 0x3F) % 5); // Extract the next 6 bits and take modulo 5
            minePositions[i] = [randValue1, randValue2];
        }

        bool hitMine = false;
        for (uint8 i = 0; i < points.length; i++) {
            for (uint8 j = 0; j < minePositions.length; j++) {
                if (
                    points[i][0] == minePositions[j][0] &&
                    points[i][1] == minePositions[j][1]
                ) {
                    hitMine = true;
                    break;
                }
            }
            if (hitMine) break;
        }

        uint256 payout = 0;
        if (!hitMine) {
            payout = calculatePayout(uint8(points.length), numMines, wager);
        }

        houseBalance += wager;
        if (payout != 0) {
            houseBalance -= payout;
            _transferPayout(playerAddress, payout, betTokenAddress);
        }

        emit MinesGameOutcome(
            playerAddress,
            wager,
            payout,
            betTokenAddress,
            points,
            minePositions
        );
    }

    function calculatePayout(
        uint8 numPoints,
        uint8 numMines,
        uint256 wager
    ) internal pure returns (uint256) {
        uint256 difficultyFactor = numPoints * numMines;
        return wager * difficultyFactor; // Adjust the payout logic as needed
    }

    function _transferWager(uint256 wager, address msgSender) internal {
        require(wager >= 1, "Wager must be at least 1");
        IERC20(betTokenAddress).safeTransferFrom(
            msgSender,
            address(this),
            wager
        );
    }

    function _transferPayout(
        address player,
        uint256 payout,
        address tokenAddress
    ) internal {
        IERC20(tokenAddress).safeTransfer(player, payout);
    }
}