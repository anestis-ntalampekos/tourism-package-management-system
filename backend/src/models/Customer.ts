import { Application, Request, Response } from 'express';
import { Account } from './Account';

import { config } from '../config';

import { utilsService } from '../lib/utils.service';

import { accountsDb } from '../lib/connectors/db/accounts-db';

import { userExistsService } from '../lib/user.service';
import { registrationService, generateAccountData } from '../lib/registration.service';

import { mailServer } from '../lib/connectors/mailServer';
import { ActivateAccountEmailTemplate } from '../lib/email-templates/ActivateAccountEmailTemplate';
import { PlanBooking } from './Booking';




export class Customer {

    account_id?: string;
    customer_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    age?: number;
    date_of_birth?: string | Date;
    id_number?: string;
    id_type?: 'id_card' | 'passport';

    place_of_residence?: {
        street?: string;
        city?: string;
        postal_code?: string;
        state?: string;
        country?: string;
        longitude?: number;
        latitude?: number;
    };


    // plans_history?: plans[]

    updated_at?: string | Date;
    created_at?: string | Date;



    // not in db
    username?: string;

    constructor(props?: Customer) {

        this.account_id = props?.account_id || null;
        this.customer_id = props?.customer_id || null;
        this.first_name = props?.first_name || null;
        this.last_name = props?.last_name || null;
        this.email = props?.email || null;
        this.phone = props?.phone || null;
        this.age = props?.age || null;
        this.date_of_birth = props?.date_of_birth || null;
        this.id_number = props?.id_number || null;
        this.id_type = props?.id_type || null;

        this.place_of_residence = props?.place_of_residence || null;

        this.updated_at = props?.updated_at || null;
        this.created_at = props?.created_at || null;


        this.username = props?.username || null;

    }





    // register user
    public async register?(req: Request, res: Response): Promise<any> {


        const registration_data: Account = new Account(req.body.customer);


        // check if the data arrived
        if (!registration_data?.first_name || !registration_data?.last_name || !registration_data?.username || !registration_data?.email
            || !registration_data?.phone || !registration_data?.password)
            return utilsService.systemErrorHandler({ code: 400, type: 'bad_request', message: 'Credentials to register the user are missing' }, res);



        // check if the user exists
        try {

            if (await userExistsService.userExists({ username: registration_data.username }))
                return utilsService.systemErrorHandler({ code: 401, type: 'username_exists', message: 'Username already exists' }, res);

            if (await userExistsService.userExists({ email: registration_data.email }))
                return utilsService.systemErrorHandler({ code: 401, type: 'email_exists', message: 'Email already exists' }, res);

            if (await userExistsService.userExists({ phone: registration_data.phone }))
                return utilsService.systemErrorHandler({ code: 401, type: 'phone_exists', message: 'Phone already exists' }, res);

        } catch (error) {
            return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
        }





        // check the password validation
        // if (registration_data.password.length < 8 || registration_data.password.length > 20)
        //     return utilsService.systemErrorHandler({ code: 402, type: 'password_out_of_range', message: 'Password length out of range' }, res);

        // if (registrationService.checkPassword(registration_data.password))
        //     return utilsService.systemErrorHandler({ code: 402, type: 'password_not_strength', message: `Password doesn't meet the criteria` }, res);





        // hash the password
        registration_data.password = utilsService.generateHash(registration_data.password);


        // if checks not failed, save the new customer account
        try {

            // insert new account
            registration_data.account_id = utilsService.generateId({ alphabet: config.nanoid_basic_alphabet, length: config.account_id_length });
            const insertion_result = await accountsDb.query(`
                INSERT INTO
                    accounts
                SET
                    account_id = :account_id,
                    username = :username,
                    first_name = :first_name,
                    last_name = :last_name,
                    email = :email,
                    phone = :phone,
                    password = :password,
                    account_type = 'customer';
            `, registration_data);




            // insert new customer data
            const insert_customer_result = await accountsDb.query(`
                INSERT INTO
                    customers
                SET
                    account_id = :account_id,
                    customer_id = :customer_id,
                    first_name = :first_name,
                    last_name = :last_name,
                    email = :email,
                    phone = :phone
            `, {
                customer_id: utilsService.generateId({ alphabet: config.nanoid_basic_alphabet, length: config.customer_id_length }),
                ...registration_data,
            });






            // create jwt for activation
            const activation_key = generateAccountData.getWebToken({
                account_id: registration_data.account_id,
                username: registration_data.username,
                email: registration_data.email,
                account_type: 'customer',
                type: 'activation_key'
            });



            const emailId = await mailServer.send_mail({
                to: [registration_data.email],
                subject: 'Thank you for your register! Please activate your account!',
                html: new ActivateAccountEmailTemplate(activation_key).html
            });




            return res.status(200).send({ code: 200, type: 'new_customer_registered', message: 'new_customer_registered_successfully' });

        } catch (error) {
            return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
        }

    }



    // logout customer
    public log_out?(req: Request, res: Response): Promise<any> {

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

    }



    // activate customer
    public async activate_customer?(data: { account_id: string }, req: Request, res: Response): Promise<void> {

        try {

            const result = await accountsDb.query(`UPDATE accounts SET activated = 1 WHERE account_id = :account_id`, { account_id: data.account_id });

        } catch (error) {
            return Promise.reject(error);
        }

    }





    // change password for the user
    public async change_password?(data: { account_id: string, password: string }, req: Request, res: Response): Promise<any> {

        // check the password validation
        if (data.password.length < 8 || data.password.length > 20)
            return utilsService.systemErrorHandler({ code: 402, type: 'password_out_of_range', message: 'Password length out of range' }, res);

        if (registrationService.checkPassword(data.password))
            return utilsService.systemErrorHandler({ code: 402, type: 'password_not_strength', message: `Password doesn't meet the criteria` }, res);



        // change the password
        try {


            const password_change_result = await accountsDb.query(`UPDATE accounts SET password = :password WHERE account_id = :account_id`, { password: utilsService.generateHash(data.password), account_id: data.account_id });

            return res.status(200).send({ code: 200, type: 'password_changed' });


        } catch (error) {
            return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
        }

    }




    // update customer
    public async update_customer?(): Promise<void> {

        if (!this?.first_name || !this?.last_name || !this?.email || !this?.phone || !this?.username)
            return Promise.reject({ code: 400, type: 'bad_request', message: 'Credentials to register the user are missing' });


        // check if the user exists
        try {

            if (await userExistsService.userExists({ username: this.username }))
                return Promise.reject({ code: 401, type: 'username_exists', message: 'Username already exists' });

            if (await userExistsService.userExists({ email: this.email }))
                return Promise.reject({ code: 401, type: 'email_exists', message: 'Email already exists' });

            if (await userExistsService.userExists({ phone: this.phone }))
                return Promise.reject({ code: 401, type: 'phone_exists', message: 'Phone already exists' });

        } catch (error) {
            return Promise.reject({ code: 500, type: 'internal_server_error', message: error?.message || null });
        }



        // if checks not failed, save the new customer account
        try {

            const account_insertion_result = await accountsDb.query(`
                UPDATE
                    accounts
                SET
                    username = :username,
                    first_name = :first_name,
                    last_name = :last_name,
                    email = :email,
                    phone = :phone
                WHERE
                    account_id = :account_id
            `, this);



            // insert new travel agent
            const insert_travel_agent_result = await accountsDb.query(`
                UPDATE
                    customers
                SET
                    last_name = :last_name,
                    email = :email,
                    phone = :phone,
                    date_of_birth = ${this?.date_of_birth ? `'${this.date_of_birth}'` : `NULL`},
                    id_number = ${this?.id_number ? `'${this.id_number}'` : `NULL`},
                    id_type = ${this?.id_type ? `'${this.id_type}'` : `NULL`},
                    place_of_residence__street = ${this?.place_of_residence?.street ? `'${this.place_of_residence.street}'` : `NULL`},
                    place_of_residence__city = ${this?.place_of_residence?.city ? `'${this.place_of_residence.city}'` : `NULL`},
                    place_of_residence__postal_code = ${this?.place_of_residence?.postal_code ? `'${this.place_of_residence.postal_code}'` : `NULL`},
                    place_of_residence__state = ${this?.place_of_residence?.state ? `'${this.place_of_residence.state}'` : `NULL`},
                    place_of_residence__country = ${this?.place_of_residence?.country ? `'${this.place_of_residence.country}'` : `NULL`},
                    place_of_residence__longitude = ${this?.place_of_residence?.longitude ? `${this.place_of_residence.longitude}` : `NULL`},
                    place_of_residence__latitude = ${this?.place_of_residence?.latitude ? `${this.place_of_residence.latitude}` : `NULL`},
                    first_name = :first_name
                WHERE
                    account_id = :account_id
            `, { ...this });



        } catch (error) {
            return Promise.reject({ code: 500, type: 'internal_server_error', message: error?.message || null });
        }


    }



    // delete customer
    public async delete_customer?(): Promise<void> {

        try {
            const delete_result = await accountsDb.query(`DELETE FROM accounts WHERE account = :account_id`, { account_id: this.account_id });
        } catch (error) {
            return Promise.reject(error);
        }

    }




    // book a plan
    public async bookPlan?(booking_details: PlanBooking, user: Account): Promise<any> {

        try {

            const insertion_result = await accountsDb.query(`
                INSERT INTO
                    bookings
                SET
                    booking_id = :booking_id,
                    plan_id = :plan_id,
                    customer_id = :customer_id,
                    booking_dates_start = :booking_dates_start,
                    booking_dates_end = :booking_dates_end,
                    card_number = :card_number;
            `, booking_details);



            const emailId = await mailServer.send_mail({
                to: [user.email],
                subject: 'Booking successfully saved! | Tourist office',
                html: 'Η κράτησή σας δημιουργήθηκε με επιτυχία! Θα λάβετε ενημερώσεις και πρόσθετες πληροφορίες για το ταξίδι σας, 5 μέρες πριν την αναχώρησή σας! Σας ευχαριστούμε που επιλέξατε εμάς για την δημιουργία του ταξιδιού σας!'
            });


            return Promise.resolve({ code: 200, type: 'booking_created' });

        } catch (error) {
            return Promise.reject(error);
        }

    }




    // delete booking with reference to the customer
    public async deleteBookingSelf?(data: { account_id: string, booking_id: string }): Promise<void> {

        try {

            const result = await accountsDb.query(`DELETE FROM bookings WHERE booking_id = :booking_id`, data);

        } catch (error) {
            return Promise.reject(error);
        }

    }


}
