// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IModuleDiscovery
 * @dev Interface for discovering modules on the BlockDAG network
 */
interface IModuleDiscovery {
    /**
     * @dev Structure to hold module information
     */
    struct Module {
        string name;
        string description;
        address moduleAddress;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    /**
     * @dev Get all available modules
     * @return Array of Module structs
     */
    function getAllModules() external view returns (Module[] memory);
    
    /**
     * @dev Get module by name
     * @param name The module name to look for
     * @return The Module struct
     */
    function getModuleByName(string calldata name) external view returns (Module memory);
    
    /**
     * @dev Get module by address
     * @param moduleAddress The module address
     * @return The Module struct
     */
    function getModuleByAddress(address moduleAddress) external view returns (Module memory);
    
    /**
     * @dev Register a new module (restricted to authorized addresses)
     * @param name Module name
     * @param description Module description
     * @param moduleAddress Module contract address
     */
    function registerModule(string calldata name, string calldata description, address moduleAddress) external;
    
    /**
     * @dev Update an existing module (restricted to authorized addresses)
     * @param moduleAddress The module address to update
     * @param newDescription Updated description
     * @param isActive Status flag
     */
    function updateModule(address moduleAddress, string calldata newDescription, bool isActive) external;
} 