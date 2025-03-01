// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title GasSaver
 * @dev Gas-optimized library for common operations using Yul inline assembly
 */
library GasSaver {
    /**
     * @dev Transfer ERC20 tokens using low-level call for gas optimization
     * @param token The ERC20 token to transfer
     * @param to The recipient address
     * @param amount The amount to transfer
     */
    function _transfer(IERC20 token, address to, uint256 amount) internal {
        assembly {
            // Get free memory pointer
            let ptr := mload(0x40)
            
            // Write the function selector for transfer(address,uint256)
            // keccak256("transfer(address,uint256)") = 0xa9059cbb
            mstore(ptr, 0xa9059cbb00000000000000000000000000000000000000000000000000000000)
            
            // Write the address parameter (to)
            mstore(add(ptr, 0x04), and(to, 0xffffffffffffffffffffffffffffffffffffffff))
            
            // Write the amount parameter
            mstore(add(ptr, 0x24), amount)
            
            // Call the token contract
            let success := call(
                gas(),          // Forward all gas
                token,          // Token contract address
                0,              // No ETH sent
                ptr,            // Input data start
                0x44,           // Input data length (4 + 32 + 32)
                0,              // Output data start
                0               // Output data length
            )
            
            // Check if the call was successful
            if iszero(success) {
                // Revert with the error message if available
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
        }
    }
    
    /**
     * @dev Approve ERC20 tokens using low-level call for gas optimization
     * @param token The ERC20 token to approve
     * @param spender The spender address
     * @param amount The amount to approve
     */
    function _approve(IERC20 token, address spender, uint256 amount) internal {
        assembly {
            // Get free memory pointer
            let ptr := mload(0x40)
            
            // Write the function selector for approve(address,uint256)
            // keccak256("approve(address,uint256)") = 0x095ea7b3
            mstore(ptr, 0x095ea7b300000000000000000000000000000000000000000000000000000000)
            
            // Write the address parameter (spender)
            mstore(add(ptr, 0x04), and(spender, 0xffffffffffffffffffffffffffffffffffffffff))
            
            // Write the amount parameter
            mstore(add(ptr, 0x24), amount)
            
            // Call the token contract
            let success := call(
                gas(),          // Forward all gas
                token,          // Token contract address
                0,              // No ETH sent
                ptr,            // Input data start
                0x44,           // Input data length (4 + 32 + 32)
                0,              // Output data start
                0               // Output data length
            )
            
            // Check if the call was successful
            if iszero(success) {
                // Revert with the error message if available
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
        }
    }
    
    /**
     * @dev Get token balance using low-level call for gas optimization
     * @param token The ERC20 token
     * @param account The account to check balance for
     * @return The token balance
     */
    function _balanceOf(IERC20 token, address account) internal view returns (uint256) {
        assembly {
            // Get free memory pointer
            let ptr := mload(0x40)
            
            // Write the function selector for balanceOf(address)
            // keccak256("balanceOf(address)") = 0x70a08231
            mstore(ptr, 0x70a0823100000000000000000000000000000000000000000000000000000000)
            
            // Write the address parameter (account)
            mstore(add(ptr, 0x04), and(account, 0xffffffffffffffffffffffffffffffffffffffff))
            
            // Call the token contract
            let success := staticcall(
                gas(),          // Forward all gas
                token,          // Token contract address
                ptr,            // Input data start
                0x24,           // Input data length (4 + 32)
                0x0,            // Output data start
                0x20            // Output data length (32 bytes for uint256)
            )
            
            // Check if the call was successful
            if iszero(success) {
                // Revert with the error message if available
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
            
            // Return the balance
            return(0x0, 0x20)
        }
    }
    
    /**
     * @dev Perform a low-level call with data
     * @param target The target contract address
     * @param data The call data
     * @return success Whether the call was successful
     * @return returnData The return data from the call
     */
    function _call(address target, bytes memory data) internal returns (bool success, bytes memory returnData) {
        assembly {
            // Get the data pointer
            let dataPtr := add(data, 0x20)
            
            // Get the data length
            let dataLength := mload(data)
            
            // Call the target contract
            success := call(
                gas(),          // Forward all gas
                target,         // Target contract address
                0,              // No ETH sent
                dataPtr,        // Input data start
                dataLength,     // Input data length
                0,              // Output data start
                0               // Output data length
            )
            
            // Get the return data size
            let returnDataSize := returndatasize()
            
            // Allocate memory for the return data
            returnData := mload(0x40)
            mstore(0x40, add(returnData, add(returnDataSize, 0x20)))
            mstore(returnData, returnDataSize)
            
            // Copy the return data
            returndatacopy(add(returnData, 0x20), 0, returnDataSize)
        }
    }
} 