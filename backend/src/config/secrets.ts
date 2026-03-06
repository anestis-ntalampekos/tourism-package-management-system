require('dotenv').config();


class SecretsConfig {

    // google oauth identifiers
    public google_oauth_login_client_id: string;
    public google_oauth_login_client_secret: string;


    constructor() {

        this.google_oauth_login_client_id = process.env.GOOGLE_OAUTH_LOGIN_CLIENT_ID;
        this.google_oauth_login_client_secret = process.env.GOOGLE_OAUTH_LOGIN_CLIENT_SECRET;

    }

}



export const secretsConfig = new SecretsConfig();
