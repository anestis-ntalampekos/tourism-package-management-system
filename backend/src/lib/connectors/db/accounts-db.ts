import * as mysql_ from 'mysql';
import { accountsDatabaseConfig } from '../../../config/db/accounts';


export interface QueryResult {
    rows: any;
    rowsCount: number;
    fields: any;
}


export class AccountsDBPool {
    public _mysql = mysql_;
    public pool: mysql_.Pool;

    public poolConfig: mysql_.PoolConfig;

    constructor() {
        this.poolConfig = {
            connectionLimit: accountsDatabaseConfig.accounts_db.limit,
            host: accountsDatabaseConfig.accounts_db.host,
            user: accountsDatabaseConfig.accounts_db.user,
            password: accountsDatabaseConfig.accounts_db.password,
            database: accountsDatabaseConfig.accounts_db.database,
            multipleStatements: accountsDatabaseConfig.accounts_db.multipleStatements,
            charset: accountsDatabaseConfig.accounts_db.charset,
            supportBigNumbers: true,
            ssl: accountsDatabaseConfig.accounts_db.ssl,
            timezone: accountsDatabaseConfig.accounts_db.timezone || 'UTC',
        };

        this.pool = mysql_.createPool(this.poolConfig);
    }



    query(sql: string, args?: object | any[]): Promise<QueryResult> {
        return new Promise((resolve, reject) => {

            this.pool.getConnection((err, connection) => {

                if (err)
                    return reject(err);

                connection.config.queryFormat = (sqlQuery, values) => {
                    if (!values) return sqlQuery;
                    return sqlQuery.replace(/\:(\w+)/g, (txt, key) => {
                        if (values.hasOwnProperty(key))
                            return connection.escape(values[key]);

                        return txt;

                    });
                };



                // const query =
                connection.query(sql, args, (error, rows, fields) => {

                    connection.release();

                    if (error)
                        return reject(error);

                    return resolve({ rows: rows, rowsCount: rows?.length || 0, fields: fields });
                });

                // console.log(query.sql);

            });

        });

    }


}


export const accountsDb = new AccountsDBPool();
