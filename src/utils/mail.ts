import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";

dotenv.config();

export const mail = async ({ email, sub, body } : { email: string, sub: string, body: string }) => {
    const sendMail = async () => {
        try {
    
            const transport = nodemailer.createTransport({
                host: "smtp-relay.sendinblue.com",
                port: 587,
                auth: {
                    user: 'webops@shaastra.org',
                    pass: process.env.MAIL_PASS
                },
            }  as SMTPTransport.Options);
    
            const mailOptions = {
                from: 'webops@shaastra.org',
                fromName: 'Shaastra 2022',
                to: email,
                subject: sub,
                html: body
            };
            const result = await transport.sendMail(mailOptions);
            return result;
        } catch (error) {
            return error;
        }
    }
    sendMail()
    .then((result) => console.log("Email sent...", result))
    .catch((error) => console.log(error.message));
}
