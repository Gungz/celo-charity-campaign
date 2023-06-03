// SPDX-License-Identifier: MIT  

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);
    function approve(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
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
		return (
			campaigns[_index]
		);
	}

    function createCampaign(
		string memory _name,
		string memory _image,
		string memory _description, 
		uint _goal,
        uint _campaignClosedDate
	) public {
        campaignsLength++;
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
		
	}
    
    function getBookmarkedCampaignIDs() public view returns (uint[] memory) {
        uint[] storage myBookmarkedCampaigns = bookmarkedCampaigns[msg.sender];
        /*uint[] memory id = new uint[](myBookmarkedCampaigns.length);
        for (uint i = 0; i < myBookmarkedCampaigns.length; i++) {
          Campaign storage campaign = myBookmarkedCampaigns[i];
          id[i] = campaign.id;
        }*/
        return (myBookmarkedCampaigns);
    }

    function bookmarkCampaigns(uint _index) public {
        uint[] storage myBookmarkedCampaigns = bookmarkedCampaigns[msg.sender];
        for (uint i = 0; i < myBookmarkedCampaigns.length; i++) {
        require(myBookmarkedCampaigns[i] != _index, "Campaign already bookmarked");
        }
        myBookmarkedCampaigns.push(_index); 
    }

    function getCampaignDonation(uint _index) public view returns (uint) {
        uint donation = campaignDonation[_index];
        return donation;
    }

    function withdrawDonation(uint _index) public payable {
        assert(IERC20Token(cUsdTokenAddress).balanceOf(address(this)) >= campaignDonation[_index]);
        require(msg.sender == campaigns[_index].owner, "Withdrawer is not campaign owner");
        require(campaigns[_index].donationWithdrawn == false);
        require(
		  IERC20Token(cUsdTokenAddress).transfer(
			msg.sender,
			campaignDonation[_index]
		  ),
		  "Withdrawal failed."
		);
        campaigns[_index].donationWithdrawn = true;
    }

    function makeDonation(uint _index, uint donation) public {
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                address(this),
                donation
            ),
            "Transfer failed."
        );
        campaignDonation[_index] += donation;
        if (campaignDonation[_index] >= campaigns[_index].goal) {
            campaigns[_index].goalReached = true;
        }
    }


    function closeCampaign(uint _index) public {
        require(msg.sender == campaigns[_index].owner, "Campaign can only be closed by owner");
        require(block.timestamp >= campaigns[_index].campaignClosedDate, "Campaign can only be closed once it has passed the closed");
        campaigns[_index].closed = true;
    }

    function getCampaignsLength() public view returns (uint) {
        return (campaignsLength);
    }
}
