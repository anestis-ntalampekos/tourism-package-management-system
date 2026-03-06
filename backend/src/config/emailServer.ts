class EmailServer {

    public accounts_email: any;


    constructor() {

        this.accounts_email = {
            host: process.env.ACCOUNTS_EMAIL_HOST,
            port: process.env.ACCOUNTS_EMAIL_PORT,
            secure: process.env.ACCOUNTS_EMAIL_SECURE_CONNECTION,
            auth: {
                user: process.env.ACCOUNTS_EMAIL_AUTH_USER,
                password: process.env.ACCOUNTS_EMAIL_AUTH_PASSWORD,
            },
            defaults: {
                name: process.env.ACCOUNTS_EMAIL_DEFAULT_NAME,
                email: process.env.ACCOUNTS_EMAIL_DEFAULT_EMAIL,
            },
        };

    }

}



export const emailServer = new EmailServer;
