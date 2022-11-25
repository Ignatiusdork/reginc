//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


contract Register {

    // the max number of wallet allowed to be registered
    uint8 public maxWalletForReg;

    // a mapping instance to track walletInReg
    mapping(address => bool) public walletInReg;

    // numWalletInReg to keep track of the number of wallet that have registered
    uint8 public numWalletInReg;

    // constructor to set the max number of wallet to be added to register
    constructor(uint8 _maxWalletForReg) {
       maxWalletForReg =  _maxWalletForReg;
    }

    
    //joinWalletToReg - This function adds the wallet address of the sender to the register list
      
    function joinWalletToReg() public {

        // this is to check if the user has already been registered
        require(!walletInReg[msg.sender], "You have already been added to the register list");

        // this is to check if the numWalletInReg < maxWalletForReg, if not we throw an error.
        require(numWalletInReg < maxWalletForReg, "Register has been filled up, try again next year");

        // this is to add the wallet address that calls the function to the walletInReg array
        walletInReg[msg.sender] = true;

        // this is to increase the number of wallet in the register by 1
        numWalletInReg += 1;
    }

}