// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

//Coinzix
contract Coinzix is Context, ERC20Permit, ERC20Burnable, Ownable {
	constructor() ERC20Permit("CZIX") ERC20("Coinzix", "CZIX") {
		_mint(msg.sender, 200000000 * 10**18);
	}

	//helper function for the airdrop
	//await erc20.increaseAllowance(this.address, "1000 * 10000 * 10**18")
	function airdrop(
		address[] memory receivers,
		uint256[] memory amounts,
		address tokenContract,
		uint256 decimals
	) external onlyOwner {
		require(receivers.length <= 50, "max 50 addresses per call");
		require(receivers.length == amounts.length, "arrays should be equal");
		IERC20 erc20token = IERC20(tokenContract);
		for (uint256 index = 0; index < receivers.length; index++) {
			erc20token.transferFrom(msg.sender, receivers[index], amounts[index] * (10**decimals));
		}
	}

	function withdraw() public onlyOwner {
		payable(msg.sender).transfer(address(this).balance); //not possible
	}

	//there's a very low change to get your tokens back if you lose them here!
	function reclaimToken(IERC20 token) public onlyOwner {
		require(address(token) != address(0));
		uint256 balance = token.balanceOf(address(this));
		token.transfer(msg.sender, balance);
	}
}
