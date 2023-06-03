// SPDX-License-Identifier: MIT  

pragma solidity >=0.7.0 <0.9.0;

/** @dev Interface representing an ERC20 token.
      * This interface defines the standard functions and events of an ERC20 token.
      * Contracts that implement this interface can be treated as ERC20 tokens.
      */
interface IERC20Token {
    /** @dev Transfers a certain amount of tokens from the caller's address to the recipient's address.
      * @param recipient The address to transfer tokens to.
      * @param amount The amount of tokens to transfer.
      * @return A boolean value indicating whether the transfer was successful or not.
      */
    function transfer(address recipient, uint256 amount) external returns (bool);
    /** @dev Approves the spender to spend a certain amount of tokens on behalf of the owner.
      * @param spender The address allowed to spend the tokens.
      * @param amount The amount of tokens the spender is allowed to spend.
      * @return A boolean value indicating whether the approval was successful or not.
      */
    function approve(address spender, uint256 amount) external returns (bool);
    /** @dev Transfers a certain amount of tokens from one address to another.
      * @param sender The address to transfer tokens from.
      * @param recipient The address to transfer tokens to.
      * @param amount The amount of tokens to transfer.
      * @return A boolean value indicating whether the transfer was successful or not.
      */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    /** @dev Returns the total supply of tokens.
      * @return The total supply of tokens.
      */
    function totalSupply() external view returns (uint256);
    /** @dev Returns the balance of tokens for a given address.
      * @param account The address to check the balance for.
      * @return The balance of tokens for the given address.
      */
    function balanceOf(address account) external view returns (uint256);
    /** @dev Returns the amount of tokens that the spender is allowed to spend on behalf of the owner.
      * @param owner The address that owns the tokens.
      * @param spender The address that is allowed to spend the tokens.
      * @return The amount of tokens that the spender is allowed to spend.
      */
    function allowance(address owner, address spender) external view returns (uint256);
    /** @dev Emitted when tokens are transferred from one address to another.
      * @param from The address tokens are transferred from.
      * @param to The address tokens are transferred to.
      * @param value The amount of tokens transferred.
      */
    event Transfer(address indexed from, address indexed to, uint256 value);
    /** @dev Emitted when the allowance of a spender for an owner is set or updated.
      * @param owner The address that owns the tokens.
      * @param spender The address that is allowed to spend the tokens.
      * @param value The new amount of tokens that the spender is allowed to spend.
      */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract DonationCampaigns {
    /** @dev Address of the contract owner.
      * Only the owner has permission to perform certain actions within the contract.
    */
    address private owner;

    /** @dev Struct that represents a campaign.
      * @param owner The address of the campaign owner.
      * @param id The unique ID of the campaign.
      * @param name The name of the campaign.
      * @param image The image associated with the campaign.
      * @param description The description of the campaign.
      * @param goal The fundraising goal of the campaign.
      * @param campaignClosedDate The date when the campaign will be closed.
      * @param closed A flag indicating whether the campaign is closed or not.
      * @param goalReached A flag indicating whether the fundraising goal is reached or not.
      * @param donationWithdrawn A flag indicating whether the donations have been withdrawn or not.
      */
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

    /** @dev Mapping that stores the bookmarked campaigns for each address.
      * @notice The key is the address of the user, and the value is an array of campaign IDs.
      */
    mapping (address => uint[]) internal bookmarkedCampaigns;

    /** @dev Mapping that stores campaign details based on their ID.
      * @notice The key is the campaign ID, and the value is an instance of the Campaign struct.
      */
    mapping (uint => Campaign) internal campaigns;

    /** @dev Mapping that stores the total donation amount for each campaign.
      * @notice The key is the campaign ID, and the value is the total donation amount.
      */
    mapping (uint => uint) internal campaignDonation;

     /** @dev Variable that stores the total number of campaigns created.
      * @notice This value is used to assign unique IDs to campaigns.
      */
    uint internal campaignsLength = 0;

    /** @dev Variable that stores the address of the cUSD token contract.
      * @notice cUSD is a stablecoin used for donations in this contract.
      */
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    /** @dev Event emitted when a new campaign is created.
      * @param campaignId The ID of the created campaign.
      * @param owner The address of the campaign owner.
      */
    event CampaignCreated(uint indexed campaignId, address indexed owner);

     /** @dev Event emitted when a donation is made to a campaign.
      * @param campaignId The ID of the campaign.
      * @param donor The address of the donor.
      * @param amount The amount of the donation.
      */
    event DonationMade(uint indexed campaignId, address indexed donor, uint256 amount);

    /** @dev Event emitted when a donation is withdrawn from a campaign.
      * @param campaignId The ID of the campaign.
      * @param recipient The address of the recipient of the withdrawn donation.
      * @param amount The amount of the withdrawn donation.
      */
    event DonationWithdrawn(uint indexed campaignId, address indexed recipient, uint256 amount);

    /** @dev Event emitted when a campaign is closed.
      * @param campaignId The ID of the closed campaign.
      */
    event CampaignClosed(uint indexed campaignId);

     /** @dev Constructor function that sets the contract owner as the deployer of the contract. */
    constructor() {
        owner = msg.sender;
    }

    /** @dev Modifier that allows only the contract owner to perform the action.
      * @notice Reverts if the caller is not the contract owner.
      */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this action.");
        _;
    }

    /** @dev Retrieve campaign details by index.
      * @param _index The index of the campaign to retrieve.
      * @return The campaign details.
    */
    function getCampaign(uint _index) public view returns (
		Campaign memory
	) {
		return (
			campaigns[_index]
		);
	}

    /** @dev Create a new campaign.
      * @param _name The name of the campaign.
      * @param _image The image associated with the campaign.
      * @param _description The description of the campaign.
      * @param _goal The fundraising goal of the campaign.
      * @param _campaignClosedDate The date when the campaign will be closed.
    */
    function createCampaign(
		string memory _name,
		string memory _image,
		string memory _description, 
		uint _goal,
        uint _campaignClosedDate
	) public onlyOwner {
        require(bytes(_name).length > 0, "Campaign name cannot be empty.");
        require(bytes(_image).length > 0, "Campaign image cannot be empty.");
        require(bytes(_description).length > 0, "Campaign description cannot be empty.");
        require(_goal > 0, "Campaign goal must be greater than zero.");
        require(_campaignClosedDate > block.timestamp, "Campaign closed date must be in the future.");
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
        emit CampaignCreated(campaignsLength, msg.sender);
		campaignsLength++;
	}
    
    /** @dev Get the campaign IDs bookmarked by the caller.
      * @return An array of campaign IDs.
    */
    function getBookmarkedCampaignIDs() public view returns (uint[] memory) {
        uint[] memory myBookmarkedCampaigns = bookmarkedCampaigns[msg.sender];
        uint[] memory campaignIDs = new uint[](myBookmarkedCampaigns.length);

        for (uint i = 0; i < myBookmarkedCampaigns.length; i++) {
            campaignIDs[i] = myBookmarkedCampaigns[i];
        }

        return campaignIDs;
    }


     /** @dev Bookmark a campaign for the caller.
      * @param _index The index of the campaign to bookmark.
    */
    function bookmarkCampaigns(uint _index) public {
        uint[] storage myBookmarkedCampaigns = bookmarkedCampaigns[msg.sender];
        myBookmarkedCampaigns.push(_index); 
    }

    /** @dev Get the total donation amount for a campaign.
      * @param _index The index of the campaign.
      * @return The total donation amount for the campaign.
    */
    function getCampaignDonation(uint _index) public view returns (uint) {
        require(_index < campaignsLength, "Invalid campaign index.");
        uint donation = campaignDonation[_index];
        return donation;
    }

    /** @dev Withdraw the donation amount for a campaign.
      * @param _index The index of the campaign.
    */
    function withdrawDonation(uint _index) public payable {
        require(_index < campaignsLength, "Invalid campaign index.");
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
        emit DonationWithdrawn(_index, msg.sender, campaignDonation[_index]);
    }

    /** @dev Make a donation to a campaign.
      * @param _index The index of the campaign.
      * @param donation The donation amount.
    */
    function makeDonation(uint _index, uint donation) public payable {
        require(_index < campaignsLength, "Invalid campaign index.");
        require(donation > 0, "Donation amount must be greater than zero.");
        require(msg.sender != campaigns[_index].owner, "Campaign creator cannot donate to their own campaign.");
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

        emit DonationMade(_index, msg.sender, donation);

    }

    /** @dev Close a campaign.
      * @param _index The index of the campaign.
    */
    function closeCampaign(uint _index) public {
        require(_index < campaignsLength, "Invalid campaign index.");
        require(msg.sender == campaigns[_index].owner, "Campaign can only be closed by owner");
        require(block.timestamp >= campaigns[_index].campaignClosedDate, "Campaign can only be closed once it has passed the closed");
        campaigns[_index].closed = true;

        emit CampaignClosed(_index);
    }

    /** @dev Get the number of campaigns.
      * @return The number of campaigns.
    */
    function getCampaignsLength() public view returns (uint) {
        return (campaignsLength);
    }
}
