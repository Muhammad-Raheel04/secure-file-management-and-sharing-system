import client from "../config/brevo.js";
import excelProcessingSuccessTemplate from "../templates/excelProcessingSuccessTemplate.js";

export const sendExcelProcessingSuccessEmail = async (name, email, fileName) => {
    try {
        await client.transactionalEmails.sendTransacEmail({
            sender: {
                name: process.env.BREVO_SENDER_NAME,
                email: process.env.BREVO_SENDER_EMAIL,
            },
            to: [{ email, name }],
            subject: "File Processed Successfully",
            htmlContent: excelProcessingSuccessTemplate(name, fileName),
            params: { name, fileName },
        })
    } catch (error) {
        console.error(error);
        throw error;
    }
}