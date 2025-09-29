import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import '../Css/MemberCenter.css';
import MemberPointMarket from '../Components/MemberPointMarket';
import DetailUpdateBtn from '../Components/DetailUpdateBtn';
import MembershipSale from '../Components/MemberSale';
import MemberPointTopupBtn from '../Components/MemberPointTopupBtn';
import News from '../Components/News.jsx';
import MembershipManual from '../Components/MembershipManual.jsx';

const MemberCenter = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

    const CMSEndpoint = import.meta.env.VITE_CMS_ENDPOINT;
    const CMSApiKey = import.meta.env.VITE_CMS_TOKEN;

    useEffect(() => {
        async function fetchAndSetUserData() {
            // Attempt to get the 'user' from a cookie
            const userCookie = Cookies.get('user');
            if (userCookie) {
                setUser(JSON.parse(userCookie));
            } else {
                navigate('/');
                return;
            }

            const apiUrl = `${CMSEndpoint}/api/rhp-memberships?filters[Email][$eq]=${JSON.parse(userCookie).email}`;

            try {
                // Make the API call to fetch the user data
                const userRes = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${CMSApiKey}`
                    }
                });

                // If the API call is successful, update the user cookie
                if (userRes.ok) {
                    const userData = await userRes.json();
                    updateUserCookie(userData.data[0]);
                } else {
                    // If response is not successful, clean up cookies and navigate to the home page
                    Cookies.remove("user");
                    Cookies.remove("AuthToken");
                    navigate("/");
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Cookies.remove("user");
                // Cookies.remove("AuthToken");
                // navigate("/");
            } finally {
                setLoading(false);
            }
        }

        // Call the asynchronous function defined inside the effect
        fetchAndSetUserData();
    }, [navigate]);


    const updateUserCookie = (userdata) => {
        let userCookie = {
            name: userdata.UserName,
            email: userdata.Email,
            contact: userdata.Contact || 'Not Specified',
            is_member: userdata.IsMember,
            tenant_type: userdata.TenantType
        };
        // If the user is a member, add additional fields to the cookie.
        if (userdata.IsMember) {
            userCookie = {
                ...userCookie,
                number: userdata.MembershipNumber || 'N/A',
                fname: userdata.FirstName || 'Not Specified',
                lname: userdata.LastName || 'Not Specified',
                exp: userdata.ExpiryDate || 'N/A',
                point: userdata.Point || 'N/A',
                discount_p: userdata.DiscountPoint || 'N/A'
            };
        }
        Cookies.set('user', JSON.stringify(userCookie));
    }

    if (!user) {
        return null;
    }

    return (
        <Container className="my-5 member-center">
            <h1 className="text-center mb-4">{t("membership_center")} <MembershipManual className='!text-left' manual="membership_center" /></h1> 
            <Card className="shadow">
                {loading ?
                    <Card.Body>
                        Updating with your details...
                    </Card.Body>
                    :
                    <Card.Body>
                        <Row className="mb-3">
                            <Col sm={3} className="text-muted">{t("login_username")}</Col>
                            <Col sm={3}>{user.name}</Col>
                            <Col sm={3} className="text-muted">{t("membership")}</Col>
                            <Col sm={3}>
                                {user.is_member ?
                                    `${t("membership_activ")}` : `${t("membership_inactiv")}`}
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col sm={3} className="text-muted">{t("email")}</Col>
                            <Col sm={3}>{user.email}</Col>
                            <Col sm={3} className="text-muted">{t("membership_contact")}</Col>
                            <Col sm={3}>{user.contact || '<Not Specified>'}</Col>
                        </Row>
                        {user.is_member ?
                            <>
                                <Row className="mb-3">
                                    {i18n.language == 'zh' ?
                                        <>
                                            <Col sm={3} className="text-muted">{t("lname")}</Col>
                                            <Col sm={3}>{user.lname || '<Not Specified>'}</Col>
                                            <Col sm={3} className="text-muted">{t("fname")}</Col>
                                            <Col sm={3}>{user.fname || '<Not Specified>'}</Col>
                                        </>
                                        : // For chinese people, revert first and last name, otherwise in normal
                                        <>
                                            <Col sm={3} className="text-muted">{t("fname")}</Col>
                                            <Col sm={3}>{user.fname || '<Not Specified>'}</Col>
                                            <Col sm={3} className="text-muted">{t("lname")}</Col>
                                            <Col sm={3}>{user.lname || '<Not Specified>'}</Col>
                                        </>
                                    }
                                </Row>
                                <Row className="mb-3">
                                    <Col sm={3} className="text-muted">{t("membership_num")}</Col>
                                    <Col sm={3}>{ user.number=='N/A' ? t("membership_issuing") : user.number }</Col>
                                    <Col sm={3} className="text-muted">{t("membership_exp")}</Col>
                                    <Col sm={3}>{user.exp}</Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col sm={3} className="text-muted">{t("membership_point")}</Col>
                                    <Col sm={3}>{user.point}</Col>
                                    <Col sm={3} className="text-muted">{t("membership_discount")}</Col>
                                    <Col sm={3}>{user.discount_p}</Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col sm={3} className="text-muted">{t("membership_total_point")}</Col>
                                    <Col sm={3}> <b> {user.point + user.discount_p} </b> </Col>
                                    <Col sm={6} className='flex justify-end'>
                                        <MemberPointTopupBtn />
                                    </Col>
                                </Row>
                            </>
                            : <></>}
                        <div className='flex justify-end'>
                            <DetailUpdateBtn />
                        </div>
                    </Card.Body>
                }
            </Card>

            <br />
            {user.is_member ?
                <MemberPointMarket />
                :
                <MembershipSale />
            }

            <br />
            <News userType="forAnnual"/>

        </Container>
    );
};

export default MemberCenter;
