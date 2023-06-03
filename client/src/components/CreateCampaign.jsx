import React, { useState, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Web3 from "web3";

import { create as ipfsHttpClient } from 'ipfs-http-client'

const projectId = process.env.REACT_APP_INFURA_PROJECT_ID;
const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET;

const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfs = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

//const ipfs = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

export default function CreateCampaign(props) {
    const { contract, account, updateFlag } = props;
    const [show, setShow] = useState(false);
    const [validated, setValidated] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(false);
    const nameRef = useRef(null);
    const descRef = useRef(null);
    const goalRef = useRef(null);
    const closeDateRef = useRef(null);
    const fileRef = useRef(null);

    const handleSubmit = async (event) => {
      const form = event.currentTarget;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
        setValidated(true);
      } else {
        event.preventDefault();
        setBtnDisabled(true);
        const added = await ipfs.add(fileRef.current.files[0]);
        const goalWei = Web3.utils.toWei(goalRef.current.value, 'ether');
        const result = await contract.methods.createCampaign(nameRef.current.value,
                                                             added.path,
                                                             descRef.current.value,
                                                             goalWei,
                                                             Math.floor(new Date(closeDateRef.current.value).getTime() / 1000)
                                                            )
                        .send({ from: account });
        console.log(result);
        setShow(false);
        setBtnDisabled(false);
        setValidated(false);
        updateFlag();
      }
    };

    const handleClose = () => {
      setShow(false);
      setValidated(false);
    }
    const handleShow = () => setShow(true);
    
    return (
        <React.Fragment>
          <div className="container">
            <div className="col-md-12 text-center mt-3">
              <Button variant="primary" onClick={handleShow}>
                  Add Donation Campaign
              </Button>
            </div>
          </div>
          
          <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Add Campaign</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                  <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicName">
                      <Form.Label>Campaign Name</Form.Label>
                      <Form.Control type="text" placeholder="Enter Campaign Name" required ref={nameRef} />
                      <Form.Control.Feedback type="invalid">
                        Please provide a campaign name.
                      </Form.Control.Feedback>
                    </Form.Group>
                  
                    <Form.Group className="mb-3" controlId="formBasicDescription">
                      <Form.Label>Campaign Description</Form.Label>
                      <Form.Control as="textarea" rows={5} placeholder="Enter Campaign Description" required ref={descRef} />
                      <Form.Control.Feedback type="invalid">
                        Please provide a campaign description.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formBasicGoal">
                      <Form.Label>Campaign Goal (in cUSD)</Form.Label>
                      <Form.Control type="number" className="w-50" required step="0.1" ref={goalRef} />
                      <Form.Control.Feedback type="invalid">
                        Please provide a campaign goal.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formBasicClosingDate">
                      <Form.Label>Campaign Closing Date</Form.Label>
                      <Form.Control type="date" className="w-50" required min={new Date().toISOString().split('T')[0]} ref={closeDateRef} />
                      <Form.Control.Feedback type="invalid">
                        Please provide a closing date.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formBasicImage">
                      <Form.Label>Campaign Image</Form.Label>
                      <Form.Control
                        type="file"
                        required
                        accept=".jpg,.jpeg,.png" ref={fileRef}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide image file.
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Button variant="primary" type="submit" disabled={btnDisabled}>
                      {btnDisabled &&
                        <Spinner
                          as="span"
                          animation="grow"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      }
                      {btnDisabled ? "Loading..." : "Submit"}
                    </Button>
                  </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={btnDisabled}>
                  Close
                </Button>
              </Modal.Footer>
          </Modal>
        </React.Fragment>
    )
}