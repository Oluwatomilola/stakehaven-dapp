// SPDX-License-Identifier: MIT
pragma solidity ^0.4.17;

/**
 * @title StakeHavenToken
 * @dev Simple ERC20 token implementation matching the ABI structure
 * Compatible with older Solidity compiler
 */
contract StakeHavenToken {
    string public name = "StakeHaven Token";
    string public symbol = "SHToken";
    uint8 public constant decimals = 18;
    
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function () external payable {
        revert("Contract does not accept direct payments");
    }

    function StakeHavenToken(uint256 initialSupply, address treasury) public {
        owner = msg.sender;
        totalSupply = initialSupply;
        _balances[treasury] = initialSupply;
        Transfer(0, treasury, initialSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 value) external returns (bool) {
        require(to != address(0));
        require(_balances[msg.sender] >= value);
        
        _balances[msg.sender] -= value;
        _balances[to] += value;
        Transfer(msg.sender, to, value);
        return true;
    }

    function allowance(address accountOwner, address spender) external view returns (uint256) {
        return _allowances[accountOwner][spender];
    }

    function approve(address spender, uint256 value) external returns (bool) {
        require(spender != address(0));
        
        _allowances[msg.sender][spender] = value;
        Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(to != address(0));
        require(_balances[from] >= value);
        require(_allowances[from][msg.sender] >= value);
        
        _balances[from] -= value;
        _balances[to] += value;
        _allowances[from][msg.sender] -= value;
        
        Transfer(from, to, value);
        return true;
    }

    function _mint(address to, uint256 value) internal {
        require(to != address(0));
        
        totalSupply += value;
        _balances[to] += value;
        Transfer(0, to, value);
    }
}