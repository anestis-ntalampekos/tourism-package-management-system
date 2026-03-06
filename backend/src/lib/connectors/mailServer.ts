import * as nodemailer from 'nodemailer';
import { emailServer } from '../../config/emailServer';
require('dotenv').config();

import { SimpleEmailAttributes } from '../../models';


class MailServer {

    async send_mail(data: SimpleEmailAttributes): Promise<string> {

        try {

            const transporter = nodemailer.createTransport({
                host: data?.host || process.env.ACCOUNTS_EMAIL_HOST,
                port: data?.port || Number(process.env.ACCOUNTS_EMAIL_PORT),
                secure: data?.secure || Number(process.env.ACCOUNTS_EMAIL_SECURE_CONNECTION) ? true : false,
                auth: {
                    user: data?.from_email || emailServer.accounts_email.auth.user,
                    pass: data?.from_psswd || emailServer.accounts_email.auth.password,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });



            let from: string;
            if (data?.from_email)
                if (data?.from_name)
                    from = `"${data.from_name}" <${data.from_email}>`;
                else
                    from = `"${emailServer.accounts_email.defaults.name}" <${data.from_email}>`;
            else
                from = `"${emailServer.accounts_email.defaults.name}" <${emailServer.accounts_email.defaults.email}>`;



            const mail = await transporter.sendMail({
                from: from,
                to: data.to,
                cc: data?.cc ? data.cc : null,
                bcc: data?.bcc ? data.bcc : null,
                subject: data.subject,
                text: data?.text ? data.text : null,
                html: data.html
            });

            return Promise.resolve(mail.messageId);

        } catch (error) {
            return Promise.reject(error);
        }

    }



}


const mailServer = new MailServer();
export { mailServer };
