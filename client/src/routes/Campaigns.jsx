import React from 'react';

export default function Campaigns({ campaignList, createCampaign }) {
 
  return (
    <React.Fragment>
        { campaignList }
        { createCampaign }
    </React.Fragment>
  );
}