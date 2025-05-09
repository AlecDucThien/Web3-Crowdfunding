// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CrowdFunding is ReentrancyGuard {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    // Modifiers
    modifier onlyOwner(uint256 _id) {
        require(msg.sender == campaigns[_id].owner, "Only the campaign owner can call this function.");
        _;
    }

    modifier validCampaign(uint256 _id) {
        require(_id < numberOfCampaigns, "Invalid campaign ID.");
        _;
    }

    // Events
    event CampaignCreated(uint256 indexed id, address owner, string title, uint256 target, uint256 deadline);
    event DonationReceived(uint256 indexed id, address donator, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address owner, uint256 amount);
    event FundsRefunded(uint256 indexed id, address donator, uint256 amount);

    // Create a new campaign
    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_owner != address(0), "Invalid owner address.");
        require(bytes(_title).length > 0, "Title cannot be empty.");
        require(bytes(_description).length > 0, "Description cannot be empty.");
        require(_target > 0, "Target must be greater than 0.");
        require(_deadline > block.timestamp, "The deadline should be a date in the future.");

        Campaign storage campaign = campaigns[numberOfCampaigns];
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++;
        emit CampaignCreated(numberOfCampaigns - 1, _owner, _title, _target, _deadline);
        return numberOfCampaigns - 1;
    }

    // Donate to a campaign
    function donateToCampaign(uint256 _id) public payable validCampaign(_id) {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign has ended.");
        require(msg.value > 0, "Donation amount must be greater than 0.");

        campaign.donators.push(msg.sender);
        campaign.donations.push(msg.value);
        campaign.amountCollected += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);
    }

    // Withdraw funds (only by campaign owner)
    function withdrawFunds(uint256 _id) public onlyOwner(_id) validCampaign(_id) nonReentrant {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.deadline, "Campaign is still ongoing.");
        require(campaign.amountCollected >= campaign.target, "Campaign did not reach target.");
        require(address(this).balance >= campaign.amountCollected, "Insufficient contract balance.");

        uint256 amount = campaign.amountCollected;
        campaign.amountCollected = 0;

        (bool sent,) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Failed to withdraw funds.");
        emit FundsWithdrawn(_id, campaign.owner, amount);
    }

    // Refund donators if campaign fails
    function refundDonators(uint256 _id) public validCampaign(_id) nonReentrant {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp > campaign.deadline, "Campaign is still ongoing.");
        require(campaign.amountCollected < campaign.target, "Campaign reached its target.");
        require(address(this).balance >= campaign.amountCollected, "Insufficient contract balance.");

        for (uint256 i = 0; i < campaign.donators.length; i++) {
            address donator = campaign.donators[i];
            uint256 amount = campaign.donations[i];
            if (amount > 0) {
                campaign.donations[i] = 0;
                (bool sent,) = payable(donator).call{value: amount}("");
                require(sent, "Failed to refund donator.");
                emit FundsRefunded(_id, donator, amount);
            }
        }
        campaign.amountCollected = 0;
    }

    // Get campaign status
    function getCampaignStatus(uint256 _id) view public validCampaign(_id) returns (string memory) {
        Campaign storage campaign = campaigns[_id];
        if (block.timestamp < campaign.deadline) {
            return "Ongoing";
        } else if (campaign.amountCollected >= campaign.target) {
            return "Successful";
        } else {
            return "Failed";
        }
    }

    // Get list of donators and their donations
    function getDonators(uint256 _id) view public validCampaign(_id) returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    // Get all campaigns (with pagination for gas optimization)
    function getCampaignsPaginated(uint256 _start, uint256 _limit) view public returns (Campaign[] memory) {
        require(_start < numberOfCampaigns, "Invalid start index.");
        uint256 end = _start + _limit > numberOfCampaigns ? numberOfCampaigns : _start + _limit;
        Campaign[] memory result = new Campaign[](end - _start);

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
        return result;
    }

    // Get all campaigns (original function for compatibility)
    function getCampaigns() view public returns (Campaign[] memory) {
        return getCampaignsPaginated(0, numberOfCampaigns);
    }
}