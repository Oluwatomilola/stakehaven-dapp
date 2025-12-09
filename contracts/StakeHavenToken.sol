// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakeHavenToken is ERC20, Ownable {
    constructor(uint256 initialSupply, address treasury) 
        ERC20("StakeHaven Token", "SHToken") 
        Ownable(msg.sender) 
    {
        _mint(treasury, initialSupply);
    }

    function _update(address from, address to, uint256 value) 
        internal 
        override(ERC20) 
    {
        super._update(from, to, value);
    }
}