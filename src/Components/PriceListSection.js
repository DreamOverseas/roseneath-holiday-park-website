import React, { useState } from 'react';
import { Card, Row, Col, Button, Modal, Image } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import '../Css/Home.css';

const PriceList = () => {
    const { t } = useTranslation();

    // Price List Sections
    const sections = [
        { title: 'dining', content: 'diningDetails', icon: '/Icons/dining.png' },
        { title: 'retail', content: 'retailDetails', icon: '/Icons/retail.png' },
        { title: 'education', content: 'educationDetails', icon: '/Icons/training.png' },
        { title: 'facilities', content: 'facilitiesDetails', icon: '/Icons/facility.png' },
        { title: 'storage', content: 'storageDetails', icon: '/Icons/storage.png' },
        { title: 'other', content: 'otherDetails', icon: '/Icons/more.png' },
    ];

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState('');

    // Handle Modal
    const handleShowModal = (content) => {
        setModalContent(t(content));
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="container mt-5">
            <Row>
                {sections.map((section, index) => (
                    <Col md={4} className="mb-4" key={index}>
                        <Card 
                            onClick={() => handleShowModal(section.content)}
                            className="home-clickable-card text-center d-flex flex-column justify-content-center align-items-center"
                        >
                            <Card.Body>
                                <Image src={section.icon} alt='Service:' className='price-list-icon' />
                                <Card.Title>{t(section.title)}</Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal for Section Details */}
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
                dialogClassName="modal-centered"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t('details')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div dangerouslySetInnerHTML={{ __html: modalContent }} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        {t('close')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PriceList;
