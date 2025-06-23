import React from 'react';
import { Container } from 'react-bootstrap';

/**
 * @param pageTitle: Set the title text
 * @param titleColor: The Title text color with default value of aliceblue
 * @param background: Set the background image, if not provided, fallback to dark gray
 * @returns A Page title set-up with the configs in the passed-in value
 */
const PageTitle = ({ pageTitle = 'Title', titleColor = '#f0f8ff', background }) => {
    return (
        <div
            className="py-4"
            style={{
                backgroundColor: background ? 'transparent' : '#303941',
                backgroundImage: background ? `url(${background})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontFamily: 'Georgia, serif',
                color: titleColor,
            }}
        >
            <Container>
                <h1>{pageTitle}</h1>
            </Container>
        </div>
    );
};

export default PageTitle;
