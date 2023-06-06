// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

contract DonationCampaigns {
    struct Campaign {
        address payable owner;
        uint id;
        string name;
        string image;
        string description;
        uint goal;
        uint campaignClosedDate;
        bool closed;
        bool goalReached;
        bool donationWithdrawn;
    }

    mapping (address => uint[]) internal bookmarkedCampaigns;
    mapping (uint => Campaign) internal campaigns;
    mapping (uint => uint) internal campaignDonation;
    uint internal campaignsLength = 0;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    function getCampaign(uint _index) public view returns (Campaign memory) {
        require(_index < campaignsLength, "Invalid campaign index");
        return campaigns[_index];
    }

    function createCampaign(
        string memory _name,
        string memory _image,
        string memory _description,
        uint _goal,
        uint _campaignClosedDate
    ) public {
        require(_goal > 0, "Goal must be greater than zero");

        campaigns[campaignsLength] = Campaign(
            payable(msg.sender),
            campaignsLength,
            _name,
            _image,
            _description,
            _goal,
            _campaignClosedDate,
            false,
            false,
            false
        );
        campaignsLength++;
    }

    function getBookmarkedCampaignIDs() public view returns (uint[] memory) {
        return bookmarkedCampaigns[msg.sender];
    }

    function bookmarkCampaigns(uint _index) public {
        require(_index < campaignsLength, "Invalid campaign index");

        uint[] storage myBookmarkedCampaigns = bookmarkedCampaigns[msg.sender];
        myBookmarkedCampaigns.push(_index);
    }

    function getCampaignDonation(uint _index) public view returns (uint) {
        return campaignDonation[_index];
    }

    function withdrawDonation(uint _index) public {
        require(_index < campaignsLength, "Invalid campaign index");
        require(msg.sender == campaigns[_index].owner, "Only the campaign owner can withdraw donations");
        require(!campaigns[_index].donationWithdrawn, "Donations already withdrawn");

        Campaign storage campaign = campaigns[_index];
        uint donation = campaignDonation[_index];

        require(IERC20Token(cUsdTokenAddress).balanceOf(address(this)) >= donation, "Insufficient contract balance");

        campaign.donationWithdrawn = true;

        require(IERC20Token(cUsdTokenAddress).transfer(msg.sender, donation), "Withdrawal failed");
    }

    function makeDonation(uint _index, uint donation) public {
        require(_index < campaignsLength, "Invalid campaign index");
        require(donation > 0, "Donation amount must be greater than zero");

        require(IERC20Token(cUsdTokenAddress).transferFrom(msg.sender, address(this), donation), "Transfer failed");

        Campaign storage campaign = campaigns[_index];
        campaignDonation[_index] += donation;

        if (!campaign.goalReached && campaignDonation[_index] >= campaign.goal) {
            campaign.goalReached = true;
        }
    }

    function closeCampaign(uint _index) public {
        require(_index < campaignsLength, "Invalid campaign index");
        require(msg.sender == campaigns[_index].owner, "Only the campaign owner can close the campaign");
        require(!campaigns[_index].closed, "Campaign already closed");
        require(block.timestamp >= campaigns[_index].campaignClosedDate, "Campaign can only be closed after the closing date");

        campaigns[_index].closed = true;
    }

    function getCampaignsLength() public view returns (uint) {
        return campaignsLength;
    }
}
