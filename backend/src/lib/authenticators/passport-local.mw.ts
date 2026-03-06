import { Application, Request, Response, NextFunction } from 'express';

import * as passportLocalStrategy from 'passport-local';
import * as passport from 'passport';
import * as bcrypt from 'bcrypt';

import { stringValidator } from '../stringValidator.service';
import { accountsDb } from '../connectors/db/accounts-db';

import { Account } from '../../models';



class InitializePassportLocalStrategy {


    public initPassport(app: Application) {


        passport.use(new passportLocalStrategy.Strategy(
            { usernameField: 'username', passwordField: 'password' }, async (username: string, password: string, result) => {

                try {

                    if (!username || !password)
                        return result(null, false, { message: '403' });



                    let find_user_query: string;
                    if (stringValidator.isEmail(username))
                        find_user_query = `SELECT * FROM accounts WHERE email = '${username}'`;
                    else
                        find_user_query = `SELECT * FROM accounts WHERE username = '${username}'`;

                    const query_result = await accountsDb.query(find_user_query);

                    if (query_result.rowsCount <= 0)
                        return result(null, false, { message: '404' });



                    const tmp_user: Account = new Account(query_result.rows[0]);


                    if (!tmp_user?.activated)
                        return result(null, false, { message: '401' });


                    if (!bcrypt.compareSync(password.toString(), tmp_user.password.toString()))
                        return result(null, false, { message: '400' });


                    delete tmp_user.password;

                    return result(null, tmp_user);

                } catch (error) {
                    result(error);
                }

            }
        ));



        passport.serializeUser((req: Request, user: Account, result) => {
            result(null, user);
        });

        passport.deserializeUser(async (user: Account, result) => {

            const query_result = await accountsDb.query(`SELECT * FROM accounts WHERE email = :email`, { email: user.email });

            if (query_result.rowsCount <= 0)
                return result(null, false);


            result(null, new Account(query_result.rows[0]));

        });

    }


}


export const initializePassportLocalStrategy = new InitializePassportLocalStrategy();
