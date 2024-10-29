import React from 'react';
import { Container } from 'react-bootstrap';

const PageTitle = ({ page_title }) => {
    return (
        <div className='page-title-bg'>
            <Container>
                <h1 className='page-title-text'>{page_title}</h1>
            </Container>
        </div>
    );
};

export default PageTitle;
