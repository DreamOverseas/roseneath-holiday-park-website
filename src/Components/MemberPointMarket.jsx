import React, { useState, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { Container, Row, Col, Card, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import '../Css/MemberCenter.css';
import AlternatingText from './AlternatingText';

const MemberPointMarket = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [currDeduction, setCurrDeduction] = useState(0);
    const [loadingRedeem, setLoadingRedeem] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [redeemProduct, setRedeemProduct] = useState(null);
    const maxDeduction = useMemo(() => {
        return redeemProduct ? Math.min(redeemProduct.MaxDeduction, redeemProduct.Price) : 0;
    }, [redeemProduct]); // Update based on existance of object redeemProduct

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const endpoint = import.meta.env.VITE_CMS_ENDPOINT;
            const apiKey = import.meta.env.VITE_CMS_TOKEN;
            const url = `${endpoint}/api/one-club-products?populate=Icon`;

            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    }
                });
                const data = await response.json();

                let items = data.data || [];

                items.sort((a, b) => a.Order - b.Order);

                setProducts(items);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) =>
        product.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCardClick = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const handleRedeemClick = (product, e) => {
        e.stopPropagation();
        setShowModal(false);
        setRedeemProduct(product);
        setShowConfirmModal(true);
    };

    const handleDeductionChange = (value) => {
        let newValue = Number(value);
        if (newValue > maxDeduction) {
            alert(`最大抵扣 ${maxDeduction}`);
            newValue = maxDeduction;
        }
        if (newValue < 0) newValue = 0;
        setCurrDeduction(newValue);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        window.location.reload();
    };

    // Used for update user points (function break-up)
    const updateUserPoints = async () => {
        const endpoint = import.meta.env.VITE_CMS_ENDPOINT;
        const apiKey = import.meta.env.VITE_CMS_TOKEN;

        const currUser = JSON.parse(Cookies.get('user'));

        const userQueryUrl = `${endpoint}/api/rhp-memberships?filters[MembershipNumber][$eq]=${currUser.number}&filters[Email][$eq]=${currUser.email}`;

        try {
            const userResponse = await fetch(userQueryUrl, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                }
            });
            const userData = await userResponse.json();

            if (userResponse.ok && userData.data && userData.data.length > 0) {
                const userRecord = userData.data[0];
                const documentId = userRecord.documentId;
                const oldPoints = userRecord.Point;
                const oldDiscountPoint = userRecord.DiscountPoint;

                const newPoints = oldPoints - (redeemProduct.Price - currDeduction);
                const newDiscountPoints = oldDiscountPoint - currDeduction;

                const updatePayload = {
                    data: {
                        Point: newPoints,
                        DiscountPoint: newDiscountPoints
                    }
                };

                const updateResponse = await fetch(`${endpoint}/api/rhp-memberships/${documentId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(updatePayload)
                });

                if (updateResponse.ok) {
                    console.log("Updated successfully");
                } else {
                    const updateError = await updateResponse.json();
                    console.log("Error updating user info:", updateError.message);
                }

                // Update Cookie
                Cookies.set('user', JSON.stringify({
                    "name": currUser.name,
                    "number": currUser.number,
                    "email": currUser.email,
                    "is_member": currUser.is_member,
                    "fname": currUser.fname,
                    "lname": currUser.lname,
                    "contact": currUser.contact,
                    "exp": currUser.exp,
                    "point": newPoints,
                    "discount_p": newDiscountPoints,
                }), { expires: 7 });
            } else {
                console.log("User not found or error fetching user data");
            }
        } catch (error) {
            console.log("Error updating user info:", error);
        }
    }

    const comfirmRedeemNow = async () => {
        setLoadingRedeem(true);
        const currUser = JSON.parse(Cookies.get('user'));
        const couponSysEndpoint = import.meta.env.VITE_COUPON_SYS_ENDPOINT;
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const couponPayload = {
            title: redeemProduct.Name,
            description: redeemProduct.Description,
            expiry: expiryDate.toISOString(),
            assigned_from: redeemProduct.Provider,
            assigned_to: currUser.name,
        };

        try {
            const couponResponse = await fetch(`${couponSysEndpoint}/create-active-coupon`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(couponPayload),
                mode: 'cors',
                credentials: 'include'
            });
            const couponData = await couponResponse.json();

            if (couponResponse.ok && couponData.couponStatus === "active") {
                const QRdata = couponData.QRdata;
                const emailApiEndpoint = import.meta.env.VITE_EMAIL_API_ENDPOINT;
                const emailPayload = {
                    name: currUser.name,
                    email: currUser.email,
                    data: QRdata,
                    title: redeemProduct.Name
                };

                const emailResponse = await fetch(`${emailApiEndpoint}/roseneathpark/coupon_distribute`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(emailPayload),
                    mode: 'cors',
                    credentials: 'include'
                });

                if (emailResponse.ok) {
                    updateUserPoints();
                    console.log("Redeemed.");
                    setLoadingRedeem(false);
                    setCurrDeduction(0);
                    setShowConfirmModal(false);
                    setShowSuccessModal(true);
                } else {
                    const emailError = await emailResponse.json();
                    console.log("Email API error:", emailError.message);
                    setLoadingRedeem(false);
                    setCurrDeduction(0);
                }
            } else {
                console.log("Coupon system error:", couponData.message);
                setLoadingRedeem(false);
                setCurrDeduction(0);
            }
        } catch (error) {
            console.log("Error in comfirmRedeemNow():", error);
            setLoadingRedeem(false);
            setCurrDeduction(0);
        }
    };


    return (
        <Container className="my-4">
            <Row>
                <Col>
                    <h2>会员点商城 / Member's Point Market</h2>
                </Col>
                <Col>
                    <Form className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="搜索 / Search ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Form>
                </Col>
            </Row>

            <Row>
                {filteredProducts.map((product) => {
                    const { Name, Icon, Price, MaxDeduction } = product;
                    const iconUrl =
                        Icon?.url
                            ? `${import.meta.env.VITE_CMS_ENDPOINT}${Icon.url}`
                            : '';

                    return (
                        <Col md={4} key={product.id} className="mb-4">
                            <Card>
                                <Card.Body onClick={() => handleCardClick(product)} style={{ cursor: 'pointer' }}>
                                    <Card.Title>{Name}</Card.Title>
                                    {iconUrl && (
                                        <Card.Img
                                            variant="top"
                                            src={iconUrl}
                                            alt={Name}
                                            className="mb-3"
                                            style={{ objectFit: 'cover', height: '200px' }}
                                        />
                                    )}
                                    <Row className="text-center d-flex">
                                        <AlternatingText
                                            text1={`${Price} 会员点`}
                                            text2={`折扣分最高抵扣${Math.min(Price, MaxDeduction)}!`}
                                            judge={MaxDeduction}
                                        />
                                    </Row>
                                </Card.Body>
                                <Card.Footer>
                                    <Button
                                        variant="dark"
                                        className="w-100"
                                        onClick={(e) => handleRedeemClick(product, e)}
                                    >
                                        现在兑换
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {selectedProduct && (
                <Modal show={showModal} onHide={handleModalClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{selectedProduct.Name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedProduct.Icon &&
                            selectedProduct.Icon &&
                            selectedProduct.Icon && (
                                <img
                                    src={`${import.meta.env.VITE_CMS_ENDPOINT}${selectedProduct.Icon.url}`}
                                    alt={selectedProduct.Name}
                                    className="img-fluid mb-3"
                                />
                            )}
                        <p>{selectedProduct.Description}</p>
                        <Row className="text-center">
                            {selectedProduct.Price} 会员点
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="dark"
                            className="w-100"
                            onClick={(e) => handleRedeemClick(selectedProduct, e)}
                        >
                            现在兑换
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {redeemProduct && (
                <Modal
                    show={showConfirmModal}
                    onHide={() => {
                        setShowConfirmModal(false);
                        setRedeemProduct(null);
                        setCurrDeduction(0);
                    }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>确认兑换</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>商品：{redeemProduct.Name}</p>
                        {(() => {
                            const userData = JSON.parse(Cookies.get('user'));
                            const cookiePoints = userData.point || 0;
                            const cookieDiscountPoints = userData.discount_p || 0;
                            return (
                                <>
                                    <p>
                                        会员点数：{cookiePoints} → <b>{cookiePoints - redeemProduct.Price + currDeduction}</b>
                                    </p>
                                    <p>
                                        折扣分：{cookieDiscountPoints} → <b>{cookieDiscountPoints - currDeduction}</b>
                                    </p>
                                    <hr />
                                    {maxDeduction > 0 ?
                                        (<Form.Group>
                                            <Row className='d-flex'>
                                                <Col md={7}>
                                                    <Form.Label>抵扣点数 ({currDeduction}/{maxDeduction})</Form.Label>
                                                </Col>
                                                <Col md={5}>
                                                    <Row>
                                                        <InputGroup>
                                                            <Form.Control
                                                                type="number"
                                                                value={currDeduction}
                                                                onChange={(e) => handleDeductionChange(e.target.value)}
                                                            />
                                                            <Button
                                                                variant="dark"
                                                                onClick={() => handleDeductionChange(Math.min(maxDeduction, cookieDiscountPoints))}
                                                            >
                                                                Max
                                                            </Button>
                                                        </InputGroup>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            <Form.Control
                                                type="range"
                                                min="0"
                                                max={maxDeduction}
                                                value={currDeduction}
                                                onChange={(e) => handleDeductionChange(e.target.value)}
                                                className="deduction-range"
                                            />
                                        </Form.Group>)
                                        : (<></>)
                                    }
                                </>
                            );
                        })()}
                    </Modal.Body>
                    <Modal.Footer>
                        {(() => {
                            const cookiePoints = JSON.parse(Cookies.get('user')).point || 0;
                            const cookieDiscountPoint = JSON.parse(Cookies.get('user')).discount_p || 0;
                            const sufficientPoints = cookiePoints >= (redeemProduct.Price - currDeduction);
                            const sufficientDiscountPoint = (cookieDiscountPoint - currDeduction) >= 0;
                            return (
                                <Button
                                    variant={(sufficientPoints && sufficientDiscountPoint) ? "dark" : "secondary"}
                                    className="w-100"
                                    disabled={!(sufficientPoints && sufficientDiscountPoint)}
                                    onClick={comfirmRedeemNow}
                                >
                                    {(sufficientPoints && sufficientDiscountPoint) ?
                                        (loadingRedeem ? "正在为您兑换.." : "兑换")
                                        :
                                        (sufficientPoints ? "折扣分不足" : "会员点不足")}
                                </Button>
                            );
                        })()}
                    </Modal.Footer>
                </Modal>
            )}

            {redeemProduct && showSuccessModal && (
                <Modal
                    show={showSuccessModal}
                    onHide={() => closeSuccessModal()}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{redeemProduct.Name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <i className="bi bi-check-circle" style={{ fontSize: '3rem', color: 'green' }}></i>
                        <p className="mt-3">兑换成功，我们已将优惠券发送至您的邮箱。</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="dark"
                            className="w-100"
                            onClick={() => closeSuccessModal()}
                        >
                            确定
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

        </Container>
    );
};

export default MemberPointMarket;
