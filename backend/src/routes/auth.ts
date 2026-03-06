import { Application, Request, Response } from 'express';
import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';

import { utilsService } from '../lib/utils.service';
import { Account, Secretariat, Customer, TravelAgent } from '../models';

import { accountsDb } from '../lib/connectors/db/accounts-db';

import { userExistsService } from '../lib/user.service';
import { registrationService, generateAccountData } from '../lib/registration.service';
import { stringValidator } from '../lib/stringValidator.service';
import { mailServer } from '../lib/connectors/mailServer';
import { RequestPasswordChangeEmailTemplate } from '../lib/email-templates/RequestPasswordChangeEmailTemplate';
require('dotenv').config();


export class AuthRoutes {


    public routes(app: Application): void {



        // local login
        app.route('/api/auth/login')
            .post(async (req: Request, res: Response) => {
                passport.authenticate('local', async (error: any, user: Account, options) => {

                    if (!options?.message) {

                        if (user?.account_id) {
                            req.session.user = user;
                            req.session.created_at = utilsService.moment().toDate();



                            if (req.session.user.account_type === 'secretariat') {

                                const secretariat_data = await accountsDb.query(`SELECT * FROM secretariat WHERE account_id = :account_id;`, { account_id: req.session.user.account_id });
                                if (secretariat_data.rowsCount === 0)
                                    return res.status(200).send({ user: req.session.user });


                                const secretary = new Secretariat(secretariat_data.rows[0]);
                                req.session.secretary = secretary;

                                return res.status(200).send({
                                    user: req.session.user,
                                    secretariat_data: secretary,
                                });

                            } else if (req.session.user.account_type === 'travel_agent') {

                                const travel_agents_data = await accountsDb.query(`SELECT * FROM travel_agents WHERE account_id = :account_id;`, { account_id: req.session.user.account_id });
                                if (travel_agents_data.rowsCount === 0)
                                    return res.status(200).send({ user: req.session.user });


                                const travel_agent = new TravelAgent(travel_agents_data.rows[0]);
                                req.session.travel_agent = travel_agent;


                                return res.status(200).send({
                                    user: req.session.user,
                                    travel_agent_data: travel_agent
                                });

                            } else if (req.session.user.account_type === 'customer') {

                                const customers_data = await accountsDb.query(`SELECT * FROM customers WHERE account_id = :account_id;`, { account_id: req.session.user.account_id });
                                if (customers_data.rowsCount === 0)
                                    return res.status(200).send({ user: req.session.user });


                                const customer = new Customer(customers_data.rows[0]);
                                req.session.customer = customer;

                                return res.status(200).send({
                                    user: req.session.user,
                                    customer_data: customer
                                });

                            } else
                                return res.status(200).send({
                                    user: req.session.user,
                                });



                        }

                        return await utilsService.systemErrorHandler({
                            code: 404,
                            type: 'user_not_found',
                            message: 'User doesn\'t exist yet'
                        }, res);

                    }






                    const message_code: number = Number(options.message);


                    if (message_code === 403)
                        return await utilsService.systemErrorHandler({
                            code: 403,
                            type: 'missing_credentials',
                            message: 'Username or password is missing'
                        }, res);
                    else if (message_code === 404)
                        return await utilsService.systemErrorHandler({
                            code: 404,
                            type: 'user_not_found',
                            message: 'User doesn\'t exist yet'
                        }, res);
                    else if (message_code === 401)
                        return await utilsService.systemErrorHandler({
                            code: 401,
                            type: 'user_not_activated',
                            message: 'User is not activated'
                        }, res);
                    else if (message_code === 400)
                        return await utilsService.systemErrorHandler({
                            code: 400,
                            type: 'wrong_password',
                            message: 'Wrong password'
                        }, res);
                    else
                        return await utilsService.systemErrorHandler({
                            code: 500,
                            type: 'undefined_error',
                            message: options.message
                        }, res);

                })(req, res);

            });





        // register new user - here you can register ONLY customers
        app.route('/api/auth/register-customer')
            .post(async (req: Request, res: Response) => {


                try {

                    const new_customer = new Customer();

                    return new_customer.register(req, res);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }


            });





        // activate the customer email
        app.route('/api/auth/activate/:token')
            .get(async (req: Request, res: Response) => {

                const activation_token = req.params.token.toString();
                const token_data = jwt.decode(activation_token, { completed: true });



                if (token_data.type !== 'activation_key')
                    return utilsService.systemErrorHandler({ code: 401, type: 'unauthorized', message: `The key isn't an activation token` }, res);



                // check if the user is already activated
                const user_activated_result = await accountsDb.query(`SELECT activated FROM accounts WHERE account_id = :account_id;`, { account_id: token_data.account_id });
                if (user_activated_result.rowsCount === 0)
                    return utilsService.systemErrorHandler({ code: 404, type: 'user_not_found', message: `The user didn't found to our system` }, res);

                const activated = Number(user_activated_result.rows[0].activated) ? true : false;
                if (activated)
                    return utilsService.systemErrorHandler({ code: 201, type: 'already_activated', message: 'This account (account email) has been already activated' }, res);




                // activate user
                if (token_data.account_type === 'customer')

                    try {

                        const customer = new Customer();
                        await customer.activate_customer({ account_id: token_data.account_id }, req, res);


                        return res.status(200).redirect(process.env.FRONTEND_LOGIN_PAGE);
                        // return res.status(200).send({ code: 200, type: 'user_activated', message: 'user_activated_successfully' });

                    } catch (error) {
                        return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                    }

                else if (token_data.account_type === 'travel_agent')

                    try {

                        const travel_agent = new TravelAgent();
                        await travel_agent.activate_travel_agent({ account_id: token_data.account_id }, req, res);


                        return res.status(200).redirect(process.env.FRONTEND_LOGIN_PAGE);
                        // return res.status(200).send({ code: 200, type: 'user_activated', message: 'user_activated_successfully' });

                    } catch (error) {
                        return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                    }

                else if (token_data.account_type === 'secretariat')

                    try {

                        const secretariat = new Secretariat();
                        await secretariat.activate_secretary({ account_id: token_data.account_id }, req, res);


                        return res.status(200).redirect(process.env.FRONTEND_LOGIN_PAGE);
                        // return res.status(200).send({ code: 200, type: 'user_activated', message: 'user_activated_successfully' });

                    } catch (error) {
                        return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                    }


            });





        // request new password
        app.route('/api/auth/request-new-password')
            .post(async (req: Request, res: Response) => {


                const user_email: string = req.body.email;

                let account: Account;

                try {

                    let account_result;
                    if (stringValidator.isEmail(user_email))
                        account_result = await accountsDb.query('SELECT * FROM accounts WHERE email = :email', { email: user_email });
                    else
                        account_result = await accountsDb.query('SELECT * FROM accounts WHERE username = :username', { username: user_email });


                    if (account_result.rowsCount === 0)
                        return utilsService.systemErrorHandler({ code: 404, type: 'user_not_found' }, res);

                    account = new Account(account_result.rows[0]);
                    delete account.password;

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }



                if (!account?.account_id)
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error' }, res);



                // generate here the jwt
                const new_token = generateAccountData.getWebToken({
                    account_id: account.account_id,
                    username: account.username,
                    email: account.email,
                    account_type: account.account_type,
                    type: 'request_password_change'
                });


                // change the status from 0 to 1 on db
                try {
                    const change_request_pwd_status_result = await accountsDb.query(`UPDATE accounts SET request_password_change = 1 WHERE account_id = :account_id`, { account_id: account.account_id });
                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }




                const emailId = await mailServer.send_mail({
                    to: [account.email],
                    subject: 'Request password change',
                    html: new RequestPasswordChangeEmailTemplate(jwt).html
                });




                return res.status(200).send({ code: 200, type: 'request_password_change_created' });


            });




        // validate the request before change the password
        app.route('/api/auth/change-password-validate/:token')
            .get(async (req: Request, res: Response) => {

                const token = req.params.token.toString();
                const token_data = jwt.decode(token, { completed: true });

                if (!token_data?.type || token_data.type !== 'request_password_change')
                    return utilsService.systemErrorHandler({ code: 401, type: 'unauthorized', message: `The key isn't a request password token` }, res);


                try {

                    const req_result = await accountsDb.query(`SELECT request_password_change FROM accounts WHERE account_id = :account_id`, { account_id: token_data?.account_id || null });
                    if (req_result.rowsCount === 0)
                        return utilsService.systemErrorHandler({ code: 404, type: 'user_not_found' }, res);

                    const req_status = req_result.rows[0].request_password_change ? true : false;
                    if (!req_status)
                        return utilsService.systemErrorHandler({ code: 404, type: 'request_not_found' }, res);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }



                return res.status(200).send({
                    code: 200,
                    type: 'successful_key_validation',
                    valid: true,
                    account_id: token_data.account_id
                });

            });




        // change password for the user
        app.route('/api/auth/change-password')
            .put(async (req: Request, res: Response) => {

                const params: { account_id: string; password: string; } = req.body;



                let account: Account;
                try {

                    const account_result = await accountsDb.query('SELECT * FROM accounts WHERE account_id = :account_id', { account_id: params.account_id });

                    if (account_result.rowsCount === 0)
                        return utilsService.systemErrorHandler({ code: 404, type: 'user_not_found' }, res);

                    account = new Account(account_result.rows[0]);
                    delete account.password;

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }





                if (account.account_type === 'customer') {

                    const customer = new Customer();
                    return customer.change_password({ account_id: account.account_id, password: account.password }, req, res);

                } else if (account.account_type === 'secretariat') {

                    const secretary = new Secretariat();
                    return secretary.change_password({ account_id: account.account_id, password: account.password }, req, res);

                } else if (account.account_type === 'travel_agent') {

                    const travel_agent = new TravelAgent();
                    return travel_agent.change_password({ account_id: account.account_id, password: account.password }, req, res);

                }



            });





        // logout from session
        app.route('/api/auth/logout')
            .post(utilsService.checkAuth, async (req: Request, res: Response) => {

                if (req.session.user.account_type === 'customer') {

                    const customer = new Customer();

                    try {
                        return customer.log_out(req, res);
                    } catch (error) {
                        return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                    }

                } else if (req.session.user.account_type === 'secretariat') {

                    const secretary = new Secretariat();

                    try {
                        return secretary.log_out(req, res);
                    } catch (error) {
                        return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                    }

                } else if (req.session.user.account_type === 'travel_agent') {

                    const travel_agent = new TravelAgent();

                    try {
                        return travel_agent.log_out(req, res);
                    } catch (error) {
                        return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                    }

                } else
                    try {

                        req.session.destroy(async (err) => {
                            if (err)
                                return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: err.message }, res);
                            else
                                return res.status(200).send({ code: 200, status: '200 OK', message: 'Logout OK' });
                        });

                    } catch (error) {
                        return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error.message }, res);
                    }

            });



    }


}
