import { Request } from 'express';
import { accountsDb } from './connectors/db/accounts-db';


class UserExistsService {


    async userExists(user_data: {
        username?: string;
        email?: string;
        phone?: string;
    }): Promise<boolean> {


        try {


            let queryWhereClause = '';

            for (const key in user_data)
                queryWhereClause += `AND ${key} = '${user_data[key]}'`;

            queryWhereClause = queryWhereClause.replace(/^.{4}/g, '');



            const result = await accountsDb.query(`SELECT account_id FROM accounts WHERE ${queryWhereClause};`);

            if (result.rowsCount === 0)
                return Promise.resolve(false);


            return Promise.resolve(true);


        } catch (error) {
            return Promise.reject(error);
        }


    }


}




export const userExistsService = new UserExistsService();

