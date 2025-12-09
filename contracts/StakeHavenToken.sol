// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

/**
 * @title StakeHavenToken
 * @dev Simple ERC20 token implementation matching the ABI structure
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

    constructor(uint256 initialSupply, address treasury) public {
        owner = msg.sender;
        totalSupply = initialSupply;
        _balances[treasury] = initialSupply;
        emit Transfer(address(0), treasury, initialSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 value) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[msg.sender] >= value, "Insufficient balance");
        
        _balances[msg.sender] -= value;
        _balances[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function allowance(address accountOwner, address spender) external view returns (uint256) {
        return _allowances[accountOwner][spender];
    }

    function approve(address spender, uint256 value) external returns (bool) {
        require(spender != address(0), "Approve to zero address");
        
        _allowances[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= value, "Insufficient balance");
        require(_allowances[from][msg.sender] >= value, "Insufficient allowance");
        
        _balances[from] -= value;
        _balances[to] += value;
        _allowances[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }

    function _mint(address to, uint256 value) internal {
        require(to != address(0), "Mint to zero address");
        
        totalSupply += value;
        _balances[to] += value;
        emit Transfer(address(0), to, value);
    }
}