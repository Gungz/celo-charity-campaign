import React, { useState, useEffect } from 'react';
import BigNumber from "bignumber.js";
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import { Link } from 'react-router-dom';
import { formatDate } from '../util/Date';

export default function CampaignList(props) {
    const { bookmarked, contract, flag } = props;
    const [campaignCards, setCampaignCards] = useState([]);
    const [show, setShow] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    useEffect(() => {
        let campaigns = [];
        const _campaigns = [];
        async function fetchCampaigns() {
             if (bookmarked === "true") {
                const ids = await contract.methods.getBookmarkedCampaignIDs().call();
                ids.forEach((id) => {
                    let _campaign = new Promise(async (resolve, reject) => {
                      let c = await contract.methods.getCampaign(id).call()
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
                        donationWithdrawn: c[9]
                      })
                    });
                    _campaigns.push(_campaign);
                });
            } else {
                const length = await contract.methods.getCampaignsLength().call();
                console.log(length);
                for (let i = 0; i < length; i++) {
                    let _campaign = new Promise(async (resolve, reject) => {
                      let c = await contract.methods.getCampaign(i).call()
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
                        donationWithdrawn: c[9]
                      })
                    });
                    _campaigns.push(_campaign);
              }
            }
            if (_campaigns.length > 0) {
                campaigns = await Promise.all(_campaigns);
            }
            setCampaignCards(campaigns.map((campaign) => 
                <Col>
                  <Card className="h-100">
                    <Card.Img variant="top" src={campaign.image} />
                    <Card.Body>
                      <Card.Title>{campaign.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">{"Closed on " + campaign.closedDateStr}</Card.Subtitle>
                      <Card.Text>
                        {campaign.description}
                      </Card.Text>
                      <Link to={"campaign/" + campaign.index}>See Detail</Link>
                    </Card.Body>
                  </Card>
                </Col>
            ));
            setDataLoaded(true);
        }
        fetchCampaigns();
    }, [bookmarked, flag])
    
    const handleClose = () => {
      setShow(false);
    }
    const handleShow = () => setShow(true);
    
    return (
        <React.Fragment>
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Add Campaign</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                 
              </Modal.Body>
              <Modal.Footer>
                
              </Modal.Footer>
            </Modal>
        
            {campaignCards.length > 0 && 
                <Container>
                    <Row xs={1} md={2} lg={3} className="g-4">
                        {campaignCards}
                    </Row>
                </Container>
            }
            {campaignCards.length === 0 && dataLoaded === true &&
                <div className="alert alert-info">
                  {bookmarked === true ? "No donation campaign has been bookmarked." : "No donation campaign has been created." }
                </div>
            }
        </React.Fragment>
    );
}