import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import {
  useParams
} from "react-router-dom";
import { formatDate } from '../util/Date';
import BigNumber from "bignumber.js";
import Web3 from "web3";

const Campaign = (props) => {
    const { id } = useParams();
    const { contract, account, cUSDContract } = props;
    const [campaign, setCampaign] = useState(null);
    const [campaignDonation, setCampaignDonation] = useState(0);
    const [donationAmount, setDonationAmount] = useState(0);
    const [donateDisabled, setDonateDisabled] = useState(false);
    const [closeDisabled, setCloseDisabled] = useState(false);
    const [withdrawDisabled, setWithdrawDisabled] = useState(false);
    const [flag, setFlag] = useState(false);
    const [dataFlag, setDataFlag] = useState(false);
    const handleDonationChange = (event) => {
        const value = parseInt(event.target.value, 10);
        setDonationAmount(value);
    };
    useEffect(() => {
        //const _camp = null;
        async function fetchCampaign() {
            let _campaign = new Promise(async (resolve, reject) => {
              let c = await contract.methods.getCampaign(id).call();
              resolve({
                index: c[1],
                owner: c[0],
                name: c[2],
                image: `https://gungz.infura-ipfs.io/ipfs/${c[3]}`,
                description: c[4],
                goal: new BigNumber(c[5]),
                closedDate: new Date(c[6] * 1000),
                closedDateStr: formatDate(new Date(c[6] * 1000)),
                closed: c[7],
                goalReached: c[8],
                donationWithdrawn: c[9],
              })
            });
            setCampaign(await _campaign);
        }
        fetchCampaign();
    }, [dataFlag])
    
    useEffect(() => {
        //const _camp = null;
        async function fetchCampaignDonation() {
            let _campaignDonation = new Promise(async (resolve, reject) => {
              let d = await contract.methods.getCampaignDonation(id).call();
              resolve(d);
            });
            setCampaignDonation(await _campaignDonation);
        }
        fetchCampaignDonation();
    }, [flag, dataFlag])
    
    const handleClose = async () => {
        setCloseDisabled(true);
        const result = await contract.methods.closeCampaign(campaign.index)
                        .send({ from: account });
        setCloseDisabled(false);
        setDataFlag(!dataFlag);
    }
    
    const handleSubmit = async (event) => {
      const form = event.currentTarget;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        event.preventDefault();
        setDonateDisabled(true);
        const donation = Web3.utils.toWei(donationAmount.toString(), 'ether');
        //console.log(donation);
        const res = await cUSDContract.methods
            .approve(process.env.REACT_APP_DONATION_CAMPAIGNS_ADDRESS, donation)
            .send({ from: account });
        //console.log(res);
        const result = await contract.methods.makeDonation(campaign.index, donation)
                        .send({ from: account });
        //console.log(result);
        setDonationAmount(0);
        setDonateDisabled(false);
        setFlag(!flag);
      }
    };
    
    const handleWithdraw = async (event) => {
        setWithdrawDisabled(true);
        const result = await contract.methods.withdrawDonation(campaign.index)
                        .send({ from: account });
        setWithdrawDisabled(false);
        setDataFlag(!dataFlag);
    }
        
    return (
        <React.Fragment>
            {campaign &&
                <Container className="mt-1" fluid>
                  <Row>
                    <Col xs={12} className="text-center">
                        <h3>{campaign.name}</h3>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} sm={4} className="text-center">
                      <img src={campaign.image} alt="Attribute" className="img-fluid rounded mx-auto d-block" />
                    </Col>
                    <Col xs={12} sm={8}>
                      <Row>
                        <Col xs={3}><h6>Campaign Description:</h6></Col>
                        <Col xs={9}><h6 style={{fontWeight: 300, whiteSpace: "pre-wrap"}}>{campaign.description}</h6></Col>
                      </Row>
                      <Row>
                        <Col xs={3}><h6>Campaign Goal:</h6></Col>
                        <Col xs={9}><h6 style={{fontWeight: 300}}>{campaign.goal / 10 ** 18} cUSD</h6></Col>
                      </Row>
                      <Row>
                        <Col xs={3}><h6>Campaign Closed Date:</h6></Col>
                        <Col xs={9}><h6 style={{fontWeight: 300}}>{campaign.closedDateStr}</h6></Col>
                      </Row>
                      <Row>
                        <Col xs={3}><h6>Campaign Status:</h6></Col>
                        <Col xs={9}><h6 style={{fontWeight: 300}}>{campaign.closed === true ? "Closed" : "Open" }</h6></Col>
                      </Row>
                      <Row className="mt-3">
                        <Col xs={9} className="text-center"><h5>So far, people have donated {campaignDonation / 10 ** 18} cUSD</h5></Col>
                      </Row>
                      {campaign.closed === false &&
                        <Form onSubmit={handleSubmit}>
                          <Row className="mt-3">
                            <Col xs={3}>
                                <Form.Label><h6>Donation Amount</h6></Form.Label>
                            </Col>
                            <Col xs={2}>
                                <Form.Control
                                      type="number"
                                      min={1}
                                      value={donationAmount}
                                      onChange={handleDonationChange}
                                    />
                            </Col>
                            <Col xs={1}><Form.Label><h6>cUSD</h6></Form.Label></Col>
                            <Col xs={2}>
                                <Button variant="primary" type="submit" disabled={donateDisabled}>
                                  {donateDisabled &&
                                    <Spinner
                                      as="span"
                                      animation="grow"
                                      size="sm"
                                      role="status"
                                      aria-hidden="true"
                                    />
                                  }
                                  {donateDisabled ? "Loading..." : "Donate"}
                                </Button>
                            </Col>
                          </Row>
                        </Form>
                      }
                      
                      {campaign.owner === account && (new Date() >= campaign.closedDate) && campaign.closed !== true &&
                          <Row className="mt-3">
                            <Col xs={9} className="text-center">
                                <Button variant="danger" disabled={closeDisabled} onClick={handleClose}>
                                  {closeDisabled &&
                                    <Spinner
                                      as="span"
                                      animation="grow"
                                      size="sm"
                                      role="status"
                                      aria-hidden="true"
                                    />
                                  }
                                  {closeDisabled ? "Loading..." : "Close Campaign"}
                                </Button>
                            </Col>
                          </Row>
                      }
                      
                      {campaign.owner === account && (new Date() >= campaign.closedDate) && campaign.closed === true && campaign.donationWithdrawn === false &&
                        <Row className="mt-3">
                            <Col xs={9} className="text-center">
                                <Button variant="secondary" disabled={withdrawDisabled} onClick={handleWithdraw}>
                                  {withdrawDisabled &&
                                    <Spinner
                                      as="span"
                                      animation="grow"
                                      size="sm"
                                      role="status"
                                      aria-hidden="true"
                                    />
                                  }
                                  {withdrawDisabled ? "Loading..." : "Withdraw Donation"}
                                </Button>
                            </Col>
                        </Row>
                      }
                      
                      {campaign.donationWithdrawn === true &&
                        <Row className="mt-3">
                            <Col xs={9} className="text-center">
                                <h5>Donation has been withdrawn by Campaign Owner</h5>
                            </Col>
                        </Row>
                      }
                    </Col>
                  </Row>
                </Container>
            }
        </React.Fragment>
  );
};

export default Campaign;
