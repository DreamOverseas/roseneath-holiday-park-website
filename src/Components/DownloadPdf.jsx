import axios from "axios";
import { Button } from 'react-bootstrap';
import { useTranslation } from "react-i18next";

const DownloadPdf = ({ pdfUrl, pdfName }) => {

    const { t } = useTranslation();

    const handleDownload = async () => {
        try {
        const response = await axios.get(pdfUrl, {
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${pdfName}`; // You can customize the file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url); // Clean up
        } catch (error) {
        console.error('Download failed:', error);
        }
    };

    return <Button onClick={handleDownload}>{t("Download_PDF")}</Button>;
};

export default DownloadPdf;