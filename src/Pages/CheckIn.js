import axios from "axios";
import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import {Image, Carousel} from 'react-bootstrap';

const CheckIn = () => {

    const { t } = useTranslation();

    const CMS_endpoint = process.env.REACT_APP_CMS_ENDPOINT;
    const CMS_token = process.env.REACT_APP_CMS_TOKEN;

    const [checkInImages, setCheckInImages] = useState([]);

    useEffect(() => {
        const fetchCheckInImage = async () => {
            try {
                const response = await axios.get(`${CMS_endpoint}/api/media-images?filters[Name][$eq]=CheckIn&populate=Image`, {
                    headers: {
                        Authorization: `Bearer ${CMS_token}`,
                    },
                });

                // Check the data structure and safely retrieve the images
                const images = response.data.data[0].Image;
                if (images) {
                    setCheckInImages(images);
                } else {
                    console.warn("No enough images are available.");
                }
            } catch (error) {
                console.error("Error loading:", error);
            }
        };

        fetchCheckInImage();
    }, [CMS_endpoint, CMS_token]);

    return (
        <Container>
            <div>
                <h4>Dear Guest,</h4>
                <br></br>
                Thank you for choosing Roseneath Holiday Park for your getaway! To ensure a smooth and enjoyable stay, please review the following steps:<br></br>
                <br></br>
                <h6>1. Advance Payment</h6>
                Please complete your payment using Visa via the link below:<br></br>
                Pay Now<br></br>
                （This excludes guests who have already paid via third-party platforms such as Airbnb.)<br></br>
                <br></br>
                <h6>2. Important Information</h6>
                As required by the Australian Caravan Park Regulations, all registered guests must:<br></br>
                • Provide their vehicle or caravan registration number<br></br>
                • Submit their name and contact details<br></br>
                • Provide their caravan’s registration number (if applicable)<br></br>
                • Complete check-in and check-out registration for record-keeping purposes<br></br>
                Please ensure this information is submitted prior to or upon arrival to comply with these regulations.<br></br>
                <br></br>
                <h6>3. Arrival and Facilities</h6>
                • Swimming Pool: Available for use.<br></br>
                • Toilets and Showers: Shared facilities are located throughout the park. Their locations are marked on the attached map.<br></br>
                • Playground: Perfect for children, located near the BBQ area.<br></br>
                • For late arrivals, please refer to the attached map to locate your reserved room or site. Keys will be on the door, and the door will be unlocked for your convenience.<br></br>
                <br></br>
                {checkInImages.length > 0 && checkInImages[0].url ? (
                    <Image
                        className="checkInImage"
                        src={`${CMS_endpoint}${checkInImages[0].url}`}
                        thumbnail
                    />
                ) : (
                    <p>Loading image...</p >
                )}
                <br></br>
                <br></br>
                <h6>4. Adjustments or Additional Requests</h6>
                If you require any adjustments or additional facilities, please notify us in advance.<br></br>
                <br></br>
                <h6>5. Contact Us</h6>
                Our team is here to assist you:<br></br>
                • Mobile: 0490 518 609<br></br>
                • Website: www.roseneathholidaypark.au<br></br>
                We look forward to hosting you and making your stay truly enjoyable!<br></br>
                <br></br>
                <b>
                Roseneath Holiday Park Management<br></br>
                Website: www.roseneathholidaypark.au<br></br>
                Mobile: 0490 518 609<br></br>
                </b>
                <br></br>
            </div>
        </Container>
    );
};

export default CheckIn;