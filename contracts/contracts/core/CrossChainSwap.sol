// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrossChainSwap
 * @dev Implements a Hashed Time-Lock Contract (HTLC) for cross-chain atomic swaps
 */
contract CrossChainSwap is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    // Events
    event SwapInitiated(
        bytes32 indexed swapId,
        address indexed initiator,
        address indexed recipient,
        address token,
        uint256 amount,
        bytes32 secretHash,
        uint256 expiration
    );
    
    event SwapClaimed(
        bytes32 indexed swapId,
        address indexed claimer,
        bytes32 secret
    );
    
    event SwapRefunded(
        bytes32 indexed swapId,
        address indexed refunder
    );
    
    // Swap status enum
    enum SwapStatus {
        INVALID,
        ACTIVE,
        CLAIMED,
        REFUNDED
    }
    
    // Swap struct
    struct Swap {
        address initiator;
        address recipient;
        address token;
        uint256 amount;
        bytes32 secretHash;
        uint256 expiration;
        SwapStatus status;
    }
    
    // Mapping from swap ID to Swap struct
    mapping(bytes32 => Swap) public swaps;
    
    // Mapping from secret hash to swap ID
    mapping(bytes32 => bytes32) public hashedSecrets;
    
    /**
     * @dev Generate a unique swap ID
     * @param initiator The initiator of the swap
     * @param recipient The recipient of the swap
     * @param token The token address (0x0 for ETH)
     * @param amount The amount to swap
     * @param secretHash The hash of the secret
     * @param expiration The expiration timestamp
     * @return The swap ID
     */
    function generateSwapId(
        address initiator,
        address recipient,
        address token,
        uint256 amount,
        bytes32 secretHash,
        uint256 expiration
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                initiator,
                recipient,
                token,
                amount,
                secretHash,
                expiration
            )
        );
    }
    
    /**
     * @dev Initiate a cross-chain swap with ETH
     * @param recipient The recipient of the swap
     * @param secretHash The hash of the secret
     * @param expiration The expiration timestamp
     * @return swapId The ID of the created swap
     */
    function initiateEthSwap(
        address recipient,
        bytes32 secretHash,
        uint256 expiration
    ) external payable nonReentrant returns (bytes32 swapId) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");
        require(expiration > block.timestamp, "Expiration must be in the future");
        
        swapId = generateSwapId(
            msg.sender,
            recipient,
            address(0),
            msg.value,
            secretHash,
            expiration
        );
        
        require(swaps[swapId].status == SwapStatus.INVALID, "Swap already exists");
        
        swaps[swapId] = Swap({
            initiator: msg.sender,
            recipient: recipient,
            token: address(0),
            amount: msg.value,
            secretHash: secretHash,
            expiration: expiration,
            status: SwapStatus.ACTIVE
        });
        
        hashedSecrets[secretHash] = swapId;
        
        emit SwapInitiated(
            swapId,
            msg.sender,
            recipient,
            address(0),
            msg.value,
            secretHash,
            expiration
        );
        
        return swapId;
    }
    
    /**
     * @dev Initiate a cross-chain swap with ERC20 tokens
     * @param token The ERC20 token address
     * @param amount The amount of tokens to swap
     * @param recipient The recipient of the swap
     * @param secretHash The hash of the secret
     * @param expiration The expiration timestamp
     * @return swapId The ID of the created swap
     */
    function initiateTokenSwap(
        address token,
        uint256 amount,
        address recipient,
        bytes32 secretHash,
        uint256 expiration
    ) external nonReentrant returns (bytes32 swapId) {
        require(amount > 0, "Amount must be greater than 0");
        require(token != address(0), "Invalid token address");
        require(recipient != address(0), "Invalid recipient");
        require(expiration > block.timestamp, "Expiration must be in the future");
        
        swapId = generateSwapId(
            msg.sender,
            recipient,
            token,
            amount,
            secretHash,
            expiration
        );
        
        require(swaps[swapId].status == SwapStatus.INVALID, "Swap already exists");
        
        // Transfer tokens to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        swaps[swapId] = Swap({
            initiator: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            secretHash: secretHash,
            expiration: expiration,
            status: SwapStatus.ACTIVE
        });
        
        hashedSecrets[secretHash] = swapId;
        
        emit SwapInitiated(
            swapId,
            msg.sender,
            recipient,
            token,
            amount,
            secretHash,
            expiration
        );
        
        return swapId;
    }
    
    /**
     * @dev Claim funds using the secret
     * @param secret The secret to claim the funds
     * @return success Whether the claim was successful
     */
    function claimFunds(bytes32 secret) external nonReentrant returns (bool success) {
        bytes32 secretHash = keccak256(abi.encodePacked(secret));
        bytes32 swapId = hashedSecrets[secretHash];
        
        require(swapId != bytes32(0), "Invalid secret");
        
        Swap storage swap = swaps[swapId];
        require(swap.status == SwapStatus.ACTIVE, "Swap not active");
        require(block.timestamp < swap.expiration, "Swap expired");
        
        // Update swap status
        swap.status = SwapStatus.CLAIMED;
        
        // Transfer funds to recipient
        if (swap.token == address(0)) {
            // Transfer ETH
            (bool sent, ) = swap.recipient.call{value: swap.amount}("");
            require(sent, "Failed to send ETH");
        } else {
            // Transfer tokens
            IERC20(swap.token).safeTransfer(swap.recipient, swap.amount);
        }
        
        emit SwapClaimed(swapId, msg.sender, secret);
        
        return true;
    }
    
    /**
     * @dev Refund expired swap
     * @param swapId The ID of the swap to refund
     * @return success Whether the refund was successful
     */
    function refund(bytes32 swapId) external nonReentrant returns (bool success) {
        Swap storage swap = swaps[swapId];
        
        require(swap.status == SwapStatus.ACTIVE, "Swap not active");
        require(block.timestamp >= swap.expiration, "Swap not expired");
        require(msg.sender == swap.initiator, "Only initiator can refund");
        
        // Update swap status
        swap.status = SwapStatus.REFUNDED;
        
        // Transfer funds back to initiator
        if (swap.token == address(0)) {
            // Transfer ETH
            (bool sent, ) = swap.initiator.call{value: swap.amount}("");
            require(sent, "Failed to send ETH");
        } else {
            // Transfer tokens
            IERC20(swap.token).safeTransfer(swap.initiator, swap.amount);
        }
        
        emit SwapRefunded(swapId, msg.sender);
        
        return true;
    }
    
    /**
     * @dev Get swap details
     * @param swapId The ID of the swap
     * @return The swap details
     */
    function getSwap(bytes32 swapId) external view returns (Swap memory) {
        return swaps[swapId];
    }
    
    /**
     * @dev Check if a swap exists for a given secret hash
     * @param secretHash The hash of the secret
     * @return Whether a swap exists for the secret hash
     */
    function hasSwap(bytes32 secretHash) external view returns (bool) {
        return hashedSecrets[secretHash] != bytes32(0);
    }
    
    // Receive function to accept ETH
    receive() external payable {}
} 