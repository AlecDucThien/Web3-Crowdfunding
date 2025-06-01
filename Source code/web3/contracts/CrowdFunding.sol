// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Importing OpenZeppelin's ReentrancyGuard to prevent reentrancy attacks
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// CrowdFunding contract inheriting ReentrancyGuard for secure fund withdrawals
contract CrowdFunding is ReentrancyGuard {
    // Struct to store campaign details
    struct Campaign {
        address owner;          // Address of the campaign creator
        string title;          // Title of the campaign
        string description;    // Description of the campaign
        uint256 target;        // Target amount to be raised (in Wei)
        uint256 deadline;      // Deadline timestamp for the campaign
        uint256 amountCollected;// Total amount collected (in Wei)
        string image;          // URL or IPFS hash of the campaign image
        address[] donators;    // List of donator addresses
        uint256[] donations;   // List of donation amounts corresponding to donators
    }

    // Mapping to store campaigns with their IDs
    mapping(uint256 => Campaign) public campaigns;
    // Counter for the total number of campaigns
    uint256 public numberOfCampaigns = 0;

    // Modifiers
    // Modifier to restrict function access to the campaign owner
    modifier onlyOwner(uint256 _id) {
        require(msg.sender == campaigns[_id].owner, "Only the campaign owner can call this function.");
        _;
    }

    // Modifier to ensure the campaign ID is valid
    modifier validCampaign(uint256 _id) {
        require(_id < numberOfCampaigns, "Invalid campaign ID.");
        _;
    }

    // Events
    // Event emitted when a new campaign is created
    event CampaignCreated(uint256 indexed id, address owner, string title, uint256 target, uint256 deadline);
    // Event emitted when a donation is received
    event DonationReceived(uint256 indexed id, address donator, uint256 amount);
    // Event emitted when funds are withdrawn by the campaign owner
    event FundsWithdrawn(uint256 indexed id, address owner, uint256 amount);
    // Event emitted when funds are refunded to a donator
    event FundsRefunded(uint256 indexed id, address donator, uint256 amount);

    // Function to create a new campaign
    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        // Ensure the owner address is valid
        require(_owner != address(0), "Invalid owner address.");
        // Ensure the title is not empty
        require(bytes(_title).length > 0, "Title cannot be empty.");
        // Ensure the description is not empty
        require(bytes(_description).length > 0, "Description cannot be empty.");
        // Ensure the target amount is greater than 0
        require(_target > 0, "Target must be greater than 0.");
        // Ensure the deadline is in the future
        require(_deadline > block.timestamp, "The deadline should be a date in the future.");

        // Initialize a new campaign in the mapping
        Campaign storage campaign = campaigns[numberOfCampaigns];
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        // Increment the campaign counter
        numberOfCampaigns++;
        // Emit event for campaign creation
        emit CampaignCreated(numberOfCampaigns - 1, _owner, _title, _target, _deadline);
        // Return the ID of the newly created campaign
        return numberOfCampaigns - 1;
    }

    // Function to donate to a specific campaign
    function donateToCampaign(uint256 _id) public payable validCampaign(_id) {
        // Get the campaign from the mapping
        Campaign storage campaign = campaigns[_id];
        // Ensure the campaign is still active
        require(block.timestamp < campaign.deadline, "Campaign has ended.");
        // Ensure the donation amount is greater than 0
        require(msg.value > 0, "Donation amount must be greater than 0.");

        // Add donator and donation amount to the campaign's lists
        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        // Update the total amount collected
        campaign.amountCollected += msg.value;

        // Emit event for donation
        emit DonationReceived(_id, msg.sender, msg.value);
    }

    // Function to withdraw funds from a successful campaign
    function withdrawFunds(uint256 _id) public onlyOwner(_id) validCampaign(_id) nonReentrant {
        // Get the campaign from the mapping
        Campaign storage campaign = campaigns[_id];
        // Ensure the campaign has ended
        require(block.timestamp >= campaign.deadline, "Campaign is still ongoing.");
        // Ensure the campaign reached its target
        require(campaign.amountCollected >= campaign.target, "Campaign did not reach target.");
        // Ensure the contract has sufficient balance
        require(address(this).balance >= campaign.amountCollected, "Insufficient contract balance.");

        // Store the amount to be withdrawn
        uint256 amount = campaign.amountCollected;
        // Reset the collected amount
        campaign.amountCollected = 0;

        // Transfer funds to the campaign owner
        (bool sent,) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Failed to withdraw funds.");
        // Emit event for fund withdrawal
        emit FundsWithdrawn(_id, campaign.owner, amount);
    }

    // Function to refund donators if the campaign fails
    function refundDonators(uint256 _id) public validCampaign(_id) nonReentrant {
        // Get the campaign from the mapping
        Campaign storage campaign = campaigns[_id];
        // Ensure the campaign has ended
        require(block.timestamp > campaign.deadline, "Campaign is still ongoing.");
        // Ensure the campaign did not reach its target
        require(campaign.amountCollected < campaign.target, "Campaign reached its target.");
        // Ensure the contract has sufficient balance
        require(address(this).balance >= campaign.amountCollected, "Insufficient contract balance.");

        // Iterate through donators to refund each one
        for (uint256 i = 0; i < campaign.donators.length; i++) {
            address donator = campaign.donators[i];
            uint256 amount = campaign.donations[i];
            if (amount > 0) {
                // Reset the donation amount
                campaign.donations[i] = 0;
                // Refund the donator
                (bool sent,) = payable(donator).call{value: amount}("");
                require(sent, "Failed to refund donator.");
                // Emit event for refund
                emit FundsRefunded(_id, donator, amount);
            }
        }
        // Reset the collected amount
        campaign.amountCollected = 0;
    }

    // Function to get the status of a campaign
    function getCampaignStatus(uint256 _id) view public validCampaign(_id) returns (string memory) {
        // Get the campaign from the mapping
        Campaign storage campaign = campaigns[_id];
        // Return "Ongoing" if the deadline has not passed
        if (block.timestamp < campaign.deadline) {
            return "Ongoing";
        // Return "Successful" if the target was met
        } else if (campaign.amountCollected >= campaign.target) {
            return "Successful";
        // Return "Failed" if the target was not met
        } else {
            return "Failed";
        }
    }

    // Function to get the list of donators and their donation amounts
    function getDonators(uint256 _id) view public validCampaign(_id) returns (address[] memory, uint256[] memory) {
        // Return the arrays of donators and donations
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    // Function to get a paginated list of campaigns for gas optimization
    function getCampaignsPaginated(uint256 _start, uint256 _limit) view public returns (Campaign[] memory) {
        // Ensure the start index is valid
        require(_start < numberOfCampaigns, "Invalid start index.");
        // Calculate the end index for pagination
        uint256 end = _start + _limit > numberOfCampaigns ? numberOfCampaigns : _start + _limit;
        // Create an array to store the result
        Campaign[] memory result = new Campaign[](end - _start);

        // Populate the result array with campaigns
        for (uint256 i = _start; i < end; i++) {
            Campaign storage item = campaigns[i];
            result[i - _start] = Campaign(
                item.owner,
                item.title,
                item.description,
                item.target,
                item.deadline,
                item.amountCollected,
                item.image,
                item.donators,
                item.donations
            );
        }
        // Return the paginated campaigns
        return result;
    }

    // Function to get all campaigns
    function getCampaigns() view public returns (Campaign[] memory) {
        // Call the paginated function with full range
        return getCampaignsPaginated(0, numberOfCampaigns);
    }
}