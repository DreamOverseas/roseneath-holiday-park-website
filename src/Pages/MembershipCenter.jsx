import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import '../Css/MemberCenter.css';
import MemberPointMarket from '../Components/MemberPointMarket';

const MemberCenter = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userCookie = Cookies.get('user');
        if (userCookie) {
            setUser(JSON.parse(userCookie));
        } else {
            navigate('/');
        }
    }, [navigate]);

    if (!user) {
        return null;
    }

    return (
        <Container className="my-5 member-center">
            <h1 className="text-center mb-4">会员中心</h1>
            <Card className="shadow">
                <Card.Body>
                    <Row className="mb-3">
                        <Col sm={4} className="text-muted">用户名</Col>
                        <Col sm={8}>{user.name}</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col sm={4} className="text-muted">邮箱</Col>
                        <Col sm={8}>{user.email}</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col sm={4} className="text-muted">会员</Col>
                        <Col sm={8}>
                            {user.is_member ? 
                            "已激活" : "未激活"}
                        </Col>
                    </Row>
                    {user.is_member ? 
                    <>
                    <Row className="mb-3">
                        <Col sm={4} className="text-muted">会员号</Col>
                        <Col sm={8}>{user.number}</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col sm={4} className="text-muted">到期日</Col>
                        <Col sm={8}>{user.exp}</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col sm={4} className="text-muted">会员点数</Col>
                        <Col sm={8}>{user.point}</Col>
                    </Row>
                    <Row className="mb-3">
                        <Col sm={4} className="text-muted">折扣分</Col>
                        <Col sm={8}>{user.discount_p}</Col>
                    </Row> </>
                    : <></>}
                </Card.Body>
            </Card>

            <br />
            <MemberPointMarket />

        </Container>
    );
};

export default MemberCenter;
