/**
 * This T&C component is meant to be able to put in any React websites for DO
 * So I'm not using any 3-rd party libs out of React
 * Sample Usage (as I first used in WCO Website):
 * <div className='text-sm text-right'>
 *    请仔细阅读我们的 <DoTermsAndConditions defaultLang='en'/>
 * </div>
*/
// src/<components folder>/DoTermsAndConditions.jsx

import React, { useState } from 'react';

const DoTermsAndConditions = ({ defaultLang = 'zh' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [lang, setLang] = useState(defaultLang);

    const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh');
    const toggleModal = () => setIsOpen(!isOpen);

        const zhContent = `任何使用罗赛尼斯半岛度假村（Roseneath Holiday Park，隶属于出国梦集团 Dream Overseas Group Pty Ltd - ABN: 531 191 108 60）网站的用户均应仔细阅读本条例：

- 服务协议  
第1条：服务条款的接受  
1、本服务条款所称的服务商、合作方是指完全同意所有条款并使用本网站及出国梦集团各项软件服务（以下称为“本服务”）的用户、商家及合作方等（以下统称为“用户”）。通过开通服务应用功能或注册、登录、使用本平台，即表示用户接受并同意受本服务条款及相关声明的约束，同时保证其提交的信息真实、合法、有效、准确、及时和完整。  
2、本服务条款以《出国梦集团用户服务协议》为基础，用户接受本服务条款，默认表示接受《出国梦集团用户服务协议》及其他全部声明的相关条款。

第2条：服务条款的变更和修改  
1、本网站提供的服务包括但不限于住宿预订、设施使用、客户信息提交、运营管理及数据查询等功能。用户在启用相关服务功能时，表明其已经了解并愿意接受该服务的功能和使用规则。  
2、罗赛尼斯半岛度假村及出国梦集团有权利根据运营情况，进行服务功能的新增、修改和删减，并保留不另行通知的权利。

第3条：服务说明  
1、本网站通过国际互联网平台向用户提供各类运营与预订服务，除非另有明确规定，任何增强或改变当前服务的新功能或产品仍适用本服务条款。  
2、罗赛尼斯半岛度假村不保证服务完全满足用户的需求，也不保证不中断、安全、及时或无误。因使用本平台产生的风险由用户自行承担。  
3、如出现以下情况，罗赛尼斯半岛度假村有权删除信息并终止服务：  
  3.1 用户违反了本服务协议或集团其他条款；  
  3.2 应用户自身申请；  
  3.3 用户违反了本网站的相关规则。

第4条：有偿服务说明  
用户在支付本网站服务费用时，须确认账户信息和操作选项。如因用户自身操作失误导致资金损失，本网站不承担任何责任。通过非法或非官方指定方式付款将不予保障，网站有权终止服务且不予退款。若服务因用户原因终止，已支付费用不予退还；若因平台方原因，则根据使用情况扣除费用后退款。

第5条：数据上传与使用说明  
1、用户提交的个人信息、入住信息、照片或其他内容仅用于本网站的服务提供、客户支持或合法用途。  
2、用户上传的数据应确保拥有完整使用权，且不侵犯第三方权利。用户同意授权本平台合理使用其上传的数据内容，用于本网站推广、服务优化等范围内，平台不承担因用户非法上传内容产生的责任。  
3、平台将依法保护用户隐私及数据安全，除法律规定或用户授权外，不会将数据提供给无关方。

第6条：用户注册与登录规定  
1、用户需提供真实有效的信息进行注册，如发现虚假信息，有权暂停或终止账号。  
2、注册用户为本平台会员，享有相应功能使用权利；但同时也需遵守本平台所有管理规范。  
3、会员信息如发生变更，用户应及时更新，因信息不实导致的责任由用户承担。  
4、用户不得将账号出租、转借他人使用，平台有权对异常行为作出冻结处理。

第7条：法律适用与管辖  
本服务条款适用中华人民共和国法律，如部分条款因违反现行法规而无效，不影响其他条款效力。用户同时应遵守《互联网电子公告服务管理规定》《互联网信息服务管理办法》等相关法规。

第8条：冲突处理  
本条款是罗赛尼斯半岛度假村与用户之间的正式法律文件，如用户的其他口头或书面声明与本条款不一致，以本条款为准，除非本条款已被废止或更新。

第9条：生效时间  
除另有说明，本条款自2013年6月8日起生效。

- 免责声明  
1、本网站上由用户发布、转载的资料、图片等信息内容，其真实性、合法性由发布者本人负责。  
2、本网站为信息发布平台，不对内容提供任何明示或暗示的担保。  
3、如内容侵犯他人知识产权，由发布者承担全部责任。  
4、因技术原因如系统故障、通信中断造成的使用问题，本网站不承担法律责任。  
5、使用本网站者视为已阅读并同意本声明。  
6、本声明未尽事项依照国家相关法律执行，若与国家法律冲突，以国家法律为准。  
7、网站拥有对本声明的解释、更新及最终修改权。

- 版权声明  
罗赛尼斯半岛度假村（Roseneath Holiday Park）由出国梦集团技术与内容支持。  
本网站所有内容（包括但不限于文字、图片、代码、设计等）版权归出国梦集团所有，未经许可，不得复制、传播、抄袭、篡改、销售等。  
用户上传内容保留署名权，视为同意授权本平台使用。若需转载本站文章，需注明出处并获得原作者许可。未经授权转载者将承担法律责任。
`;

    const enContent = `All users of Roseneath Holiday Park (a service operated under Dream Overseas Group Pty Ltd - ABN: 531 191 108 60) are advised to read these terms and conditions carefully:

I. Service Agreement

Article 1: Acceptance of Terms of Service  
These Terms apply to all users, partners, and service providers using the Roseneath Holiday Park platform. By registering, logging in, or accessing services, users agree to be bound by these Terms and related declarations. All information submitted must be truthful, legal, and complete.  
These Terms are based on the “Dream Overseas Group User Service Agreement,” and accepting these Terms constitutes agreement to all policies stated therein.

Article 2: Modification of Terms  
Roseneath Holiday Park reserves the right to change, add, or remove service functions including but not limited to accommodation booking, customer information, operations, and other features.

Article 3: Description of Services  
Services are provided via the Internet through Dream Overseas Group’s systems. All new or modified services are subject to these Terms.  
No guarantees are made regarding service continuity or satisfaction. Users bear all risks related to using the services.  
Roseneath reserves the right to remove content or suspend access if:  
- Violation of these Terms or Dream Overseas Group’s agreement  
- By user request  
- Violation of service rules

Article 4: Paid Services  
Users must verify payment details before proceeding. The platform is not liable for errors due to incorrect input or unauthorized methods. Payments made via unofficial means are not guaranteed. If terminated by the user, no refund is issued. If terminated by the platform, unused amounts may be refunded after deduction.

Article 5: Data Submission and Use  
1. Any data submitted (e.g., booking info, user photos, forms) will only be used for legitimate purposes such as service delivery and platform improvement.  
2. Users must own all rights to uploaded content and authorize the platform to use such content as needed. Dream Overseas Group disclaims liability for illegal content submitted by users.  
3. User data will be protected under applicable privacy laws. The platform will not share data with third parties without legal basis or user consent.

Article 6: Registration and Account Use  
1. Users must provide accurate information during registration; false data may result in suspension.  
2. Registered users are granted access to member-only features and must comply with all platform rules.  
3. Users are responsible for updating their information.  
4. Account sharing or rental is prohibited. Suspicious activity may lead to temporary or permanent suspension.

Article 7: Governing Law and Jurisdiction  
These Terms shall be governed by the laws of the People’s Republic of China. If any clause is found invalid, the remaining parts remain effective. Users agree to comply with the “Administrative Regulations on Internet Electronic Bulletin Services” and “Administrative Measures for Internet Information Services.”

Article 8: Conflict Resolution  
These Terms override any conflicting verbal or written statements unless officially amended or replaced by Dream Overseas Group.

Article 9: Effective Date  
These Terms are effective from June 8, 2013, unless otherwise stated.

II. Disclaimer  
All content submitted or reposted is the sole responsibility of the user.  
Roseneath Holiday Park operates as a hosting platform and provides no guarantees.  
Roseneath is not liable for service disruptions due to hacking or technical failures.  
Use of this site implies agreement with these Terms.  
In the event of a conflict with applicable laws, national legislation shall prevail.  
The platform reserves all rights to interpret and amend this disclaimer.

III. Copyright Notice  
Roseneath Holiday Park is supported by Dream Overseas Group Pty Ltd.  
All website content—including text, graphics, code, and images—is the intellectual property of Dream Overseas Group.  
No unauthorized copying, modification, or dissemination is permitted.  
Uploaded content retains author attribution but grants the platform a royalty-free license to use, edit, or adjust content.  
Any republication must cite the source and obtain permission from the original author. Unauthorized republication may lead to legal action.
`;

    return (
        <span>
            <button type="button" style={styles.linkButton} onClick={toggleModal}>{lang === 'zh' ? "服务条款" : "Terms & Conditions"}</button>
            {isOpen && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.header}>
                            <button type="button" style={styles.langSwitch} onClick={toggleLang}>{lang === 'zh' ? 'English' : '中文'}</button>
                            <b>{lang === 'zh' ? "服务条款" : "Terms & Conditions"}</b>
                            <button type="button" style={styles.closeBtn} onClick={toggleModal}>×</button>
                        </div>
                        <div style={styles.content}>{lang === 'zh' ? zhContent : enContent}</div>
                        <button type="button" style={styles.confirmBtn} onClick={toggleModal}>{lang === 'zh' ? "确定" : "Comfirm"}</button>
                    </div>
                </div>
            )}
        </span>
    );
};

const styles = {
    linkButton: {
        color: 'blue',
        textDecoration: 'underline',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontSize: 'inherit'
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        textAlign: 'left',
        display: 'block',
        backgroundColor: 'white',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        borderRadius: '8px',
        padding: '1rem',
        flexDirection: 'column',
        position: 'relative'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#888'
    },
    langSwitch: {
        background: 'none',
        border: '1px solid #888',
        borderRadius: '4px',
        padding: '0.2rem 0.5rem',
        fontSize: '0.9rem',
        cursor: 'pointer'
    },
    content: {
        flexGrow: 1,
        whiteSpace: 'pre-wrap',
        marginBottom: '1rem',
        fontSize: '0.95rem',
        maxHeight: '60vh',
        overflowY: 'auto',
        color: '#333'
    },
    confirmBtn: {
        width: '100%',
        backgroundColor: '#007BFF',
        color: 'white',
        border: 'none',
        padding: '0.5rem',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer'
    }
};

export default DoTermsAndConditions;
