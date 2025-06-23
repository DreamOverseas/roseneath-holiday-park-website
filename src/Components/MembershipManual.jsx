import React, { useState } from 'react'
import { useTranslation } from "react-i18next";
import ReactDOM from 'react-dom'

const MembershipManual = ({ manual }) => {
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(false);

    const { t, i18n } = useTranslation();
    const currLang = i18n.language;

    const getManual = (key, lang) => {
        if (lang !== 'zh' && lang !== 'en') {
            return <p>
                !@#F!@!#$@ (╯°□°)╯︵ ┻━┻ ✶✷⚠✖⚡⛓
                (Please choose a supported language)
                </p>
        }
        switch (key) {
            case 'membership_center':
                return <div>
                    <h5 class='text-lg font-semibold mb-2'>{t("membership_center")}</h5>
                    <div dangerouslySetInnerHTML={{__html: t("manual.member_center.content")}}/>
                </div>;
            case 'member_point_market':
                return <div>
                    <h5 class='text-lg font-semibold mb-2'>{t("manual.point_market")}</h5>
                    <div dangerouslySetInnerHTML={{__html: t("manual.point_market.content")}}/>
                </div>;
            case 'search':
                return <div>
                    <h5 class='text-lg font-semibold mb-2'>{t("manual.search")}</h5>
                    
                    <div dangerouslySetInnerHTML={{__html: t("manual.search.content")}}/>
                </div>;
            default:
                return <p>{t("manual.fallback")}</p>;
        }
    }

    const manualModal = (
    <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50"
        onClick={() => setOpen(false)}
    >
        <div
            className="bg-white w-11/12 max-w-lg rounded-xl shadow-lg animate-fade-in max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2 border-b bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl">
                <h3 className="text-lg my-0 text-white font-semibold">{t("manual")}</h3>
                <button
                    onClick={() => setOpen(false)}
                    className="text-white hover:text-gray-500 text-sm"
                >
                    <i className="bi bi-x-lg text-3xl"></i>
                </button>
            </div>

            {/* Body rendered dynamically */}
            <div className="p-2 md:p-4 text-sm text-gray-800" >
                {getManual(manual, currLang)}
            </div>

            {/* Fo0o0o0oter */}
            <div className="flex justify-end px-4 py-1 border-t text-center">
                <button
                    onClick={() => setOpen(false)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                >
                    <div className='text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:text-amber-700/50'>
                        {t("membership_comfirm")}
                    </div>
                </button>
            </div>
        </div>
    </div>
    )

    return (
        <>
            {/* The Icon Button */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="text-2xl text-gray-600 hover:text-gray-700 transition-all"
            >
                <i className={`bi text-2xl ${hovered ? 'bi-patch-question-fill' : 'bi-patch-question'}`}></i>
            </button>

            {/* MOOOOOOOOOOOOODal rendered on base document (whole screen) */}
            {open && ReactDOM.createPortal(manualModal, document.body)}

            {/* Slide-up entry animation here, i dont want too many css */}
            <style>
                {`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
        `}
            </style>
        </>
    )
}

export default MembershipManual
