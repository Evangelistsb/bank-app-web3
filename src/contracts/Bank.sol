// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BankContract {
    struct Account {
        uint256 accountId;
        string accountUsername;
        uint256 accountBalance;
        uint256 lastDeposit;
        uint256 lastTransfer;
    } 

    event Deposit(address indexed account, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);
    event CreateAccount(address indexed owner);

    modifier validAccount(address account) {
        require(accounts[account].accountId != 0, "invalid account");
        _;
    }

    mapping(address => Account) private accounts;
    uint256 private accountIds = 1;

    // create new account
    function createAccount(string calldata username) external {
        require(bytes(username).length > 0, "invalid username");
        require(accounts[msg.sender].accountId == 0, "existing account detected");
        accounts[msg.sender] = Account(accountIds, username, 0, 0, 0);
        accountIds++;
        emit CreateAccount(msg.sender);
    }

    // deposit into existing account
    function deposit() external payable validAccount(msg.sender) {
        Account storage account = accounts[msg.sender];
        uint256 amount = msg.value;
        account.accountBalance += amount;
        account.lastDeposit = block.timestamp;

        emit Deposit(msg.sender, amount);
    }

    // withdraw from existing account
    function withdraw(uint256 amount) external payable validAccount(msg.sender) {
        Account storage account = accounts[msg.sender];
        require(amount > 0, "invalid amount");
        require(account.accountBalance >= amount, "insufficient funds");
        // Debit amount from balance
        account.accountBalance -= amount;
        // Transfer to user wallet 
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, "transfer unsuccessful");

        emit Withdraw(msg.sender, amount);
    }

    // check balance
    function checkBalance(address account) public view validAccount(msg.sender) returns (uint256) {
         Account memory details = accounts[account];
         uint256 balance = details.accountBalance;
         return balance;
    }

    // transfer to another account
    function transfer(address to, uint256 amount) external payable validAccount(to) {
        require(amount > 0, "invalid amount");
        require(checkBalance(msg.sender) >= amount, "insufficient funds");

        // Get accounts involved in transaction
        Account storage senderAccount = accounts[msg.sender];
        Account storage receiverAccount = accounts[to];

        // Debit sender
        senderAccount.accountBalance -= amount;
        // Credit receiver
        receiverAccount.accountBalance += amount;

        senderAccount.lastTransfer = block.timestamp;
        receiverAccount.lastDeposit = block.timestamp;
        emit Transfer(msg.sender, to, amount);
    }

    // get account details
    function accountDetails() external view returns (
        uint256, 
        string memory, 
        uint256, 
        uint256,
        uint256
    ) {
        return (
            accounts[msg.sender].accountId,
            accounts[msg.sender].accountUsername,
            accounts[msg.sender].accountBalance,
            accounts[msg.sender].lastDeposit,
            accounts[msg.sender].lastTransfer
        );
    }
}