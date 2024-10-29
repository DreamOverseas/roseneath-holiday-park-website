import React from "react";
import "../Css/FindUs.css";
import {Container,Row,Col,Image,Button} from 'react-bootstrap'
// import MapComponent from "../Components/MapComponent";

const FindUs = () => {

    // TODO

    return (
        <div>
            <section>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d474013.57073654904!2d150.801209!3d-37.457687!3m2!1i1024!2i768!4f13.5!3m3!1m2!1s0x6b2f12fa55ba106b%3A0x97796bb5b7b2aa37!2sRoseneath%20Holiday%20Park!5e1!3m2!1sen!2sus!4v1730163420007!5m2!1sen!2sus"
                    width="100%"
                    height="700"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </section>
            <section>
                <Container>
                    <Row>
                        <Col>
                            <Image className="find-us-picture" src="/find_us/map.webp"/>
                        </Col>
                        <Col>
                            <p>The quickest way to get to us from Melbourne is to travel along Princes Hwy A1 till you get to Sale.  Turn left at the roundabout and stay on Princes Hwy (York St) till you get to Bengworden Road C106, where you turn right. follow Bengworden Rd all the way to the end and turn right. You then turn right onto Hollands Landing Road. Continue till you get to 422 Woodpile Road Meerlieu.</p>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default FindUs;
