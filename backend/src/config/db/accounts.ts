require('dotenv').config();


class AccountsDatabaseConfig {

    public accounts_db: any;

    constructor() {

        this.accounts_db = {
            host: process.env.ACCOUNTS_DB__HOST,
            port: process.env.ACCOUNTS_DB__PORT,
            user: process.env.ACCOUNTS_DB__USERNAME,
            password: process.env.ACCOUNTS_DB__PASSWORD,
            database: process.env.ACCOUNTS_DB__DB_NAME,
            multipleStatements: process.env.ACCOUNTS_DB__MULTIPLE_STATEMENTS,
            charset: process.env.ACCOUNTS_DB__CHARSET,
            character_set_server: process.env.ACCOUNTS_DB__CHARSET_SET_SERVER,
            connection_limit: process.env.ACCOUNTS_DB__CONNECTION_LIMIT,
            timezone: process.env.ACCOUNTS_DB__TIMEZONE,
        };

    }

}



export const accountsDatabaseConfig = new AccountsDatabaseConfig();
