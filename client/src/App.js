import React, { Component } from "react";
import Button from 'react-bootstrap/Button';
//import SimpleStorageContract from "./contracts/SimpleStorage.json";
import DonationCampaigns from "./contracts/donationcampaigns.abi.json";
import ERC20 from "./contracts/erc20.abi.json";
import getWeb3 from "./getWeb3";
import { newKitFromWeb3 } from "@celo/contractkit"
import {
  Routes,
  Route,
} from "react-router-dom";

import "./App.css";
import Campaigns from './routes/Campaigns';
import CampaignList from './components/CampaignList';
import CreateCampaign from './components/CreateCampaign';
import Campaign from './components/Campaign';
import { LinkContainer } from 'react-router-bootstrap'
import Nav from 'react-bootstrap/Nav'

class App extends Component {
  state = { flag: false, web3: null, accounts: null, contract: null, account: null, kit: null, cUSDContract: null };

  updateFlag = () => {
    console.log("update flag");
    this.setState({ flag: !this.state.flag });
  }
  
  login = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      
      const kit = newKitFromWeb3(web3);
      const accounts = await kit.web3.eth.getAccounts();
      kit.defaultAccount = accounts[0];
      kit.connection.defaultAccount = accounts[0];

      const instance = new kit.web3.eth.Contract(DonationCampaigns, process.env.REACT_APP_DONATION_CAMPAIGNS_ADDRESS);
      const cUSDContract = new kit.web3.eth.Contract(ERC20, process.env.REACT_APP_CUSD_CONTRACT_ADDRESS);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, account: kit.defaultAccount, kit, cUSDContract });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }
  
  logout = async () => {
    if (window.celo.isConnected()) {
      try {
        const { kit } = this.state;
        kit.connection.stop();
        kit.defaultAccount = null;
        kit.connection.defaultAccount = null;
        
        this.setState({ web3: null, accounts: null, contract: null, account: null });
      } catch (error) {
        console.error(error);
      }
    }
  }

  render() {
    if (!this.state.web3) {
      return (
        <React.Fragment>
          <div className="row">
            <div className="col-md-10 text-center mt-1">
              Please login with your Celo Wallet to use this app
            </div>
            <div className="col-md-2 text-end mt-1">
              <Button variant="primary" size="sm" className="me-2" onClick={this.login}>
                  Login with Celo Wallet
              </Button>
            </div>
          </div>
        
        </React.Fragment>
      )
    }
    const allCampaigns = (
      <CampaignList bookmarked="false" contract={this.state.contract} flag={this.state.flag} />
    );
    const createCampaign = (
      <CreateCampaign contract={this.state.contract} account={this.state.account} updateFlag={this.updateFlag} />
    );
    return (
      <React.Fragment>
        <Nav variant="tabs">
          <Nav.Item>
            <LinkContainer to="/">
              <Nav.Link>All Campaigns</Nav.Link>
            </LinkContainer>
          </Nav.Item>
          <Nav.Item className="ms-auto mt-auto mb-auto me-2 small">
            <strong>Your Account: </strong> { this.state.account } 
            <Button variant="secondary" size="sm" className="ms-3 me-2" onClick={this.logout}>
              Logout
            </Button>
          </Nav.Item>
        </Nav>
        
        <Routes>
          <Route path="/" element={<Campaigns campaignList={allCampaigns} createCampaign={createCampaign} />} />
          <Route path="/campaign/:id" element={<Campaign contract={this.state.contract} account={this.state.account} cUSDContract={this.state.cUSDContract} />} />
        </Routes>
      </React.Fragment>
      
      
    );
  }
}

export default App;
