// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IDiamondCut
 * @dev Interface for diamond standard facet management
 */
interface IDiamondCut {
    enum FacetCutAction {Add, Replace, Remove}

    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    /**
     * @dev Add, replace, or remove facet functions
     * @param _diamondCut Array of facet addresses and function selectors
     * @param _init Address of contract or facet to execute _calldata
     * @param _calldata Function call data to execute
     */
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;

    event DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata);
} 