import { Application, Request, Response } from 'express';
import { accountsDb } from '../lib/connectors/db/accounts-db';

import { utilsService } from '../lib/utils.service';
import { userExistsService } from '../lib/user.service';
import { registrationService, generateAccountData } from '../lib/registration.service';
import { TravelPlan } from './TravelPlan';
import { createNewPlan, deleteExistingPlan, updateExistingPlan } from '../lib/manage-plan.service';
import { PlanBooking } from './Booking';
import { Account } from './Account';
import { mailServer } from '../lib/connectors/mailServer';


export class TravelAgent {

    account_id?: string;
    travel_agent_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
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

    start_date?: string | Date;
    still_working?: boolean;

    office_details?: {
        email?: string;
        phone?: string;
    };


    // organized_plans: plan[]

    updated_at?: string | Date;
    created_at?: string | Date;



    // not in db
    password?: string;
    username?: string;

    constructor(props?: TravelAgent) {

        this.account_id = props?.account_id || null;
        this.travel_agent_id = props?.travel_agent_id || null;
        this.first_name = props?.first_name || null;
        this.last_name = props?.last_name || null;
        this.email = props?.email || null;
        this.phone = props?.phone || null;
        this.date_of_birth = props?.date_of_birth || null;
        this.id_number = props?.id_number || null;
        this.id_type = props?.id_type || null;

        this.place_of_residence = props?.place_of_residence || null;

        this.start_date = props?.start_date || null;
        this.still_working = props?.still_working ? true : false;

        this.office_details = props?.office_details || null;

        this.updated_at = props?.updated_at || null;
        this.created_at = props?.created_at || null;


        this.password = props?.password || null;
        this.username = props?.username || null;

    }











    // travel agent logout
    public log_out(req: Request, res: Response): Promise<any> {

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




    // travel agent activate account
    public async activate_travel_agent(data: { account_id: string }, req: Request, res: Response): Promise<void> {

        try {

            const result = await accountsDb.query(`UPDATE accounts SET activated = 1 WHERE account_id = :account_id`, { account_id: data.account_id });

        } catch (error) {
            return Promise.reject(error);
        }

    }





    // change password for the user
    public async change_password(data: { account_id: string, password: string }, req: Request, res: Response): Promise<any> {

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




    // update the specific travel agent
    public async update_travel_agent(): Promise<void> {

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
                    travel_agents
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
                    start_date = ${this?.start_date ? `'${this.start_date}'` : `NULL`},
                    still_working = ${this.still_working ? 1 : 0},
                    office_details__email = ${this?.office_details?.email ? `'${this.office_details.email}'` : `NULL`},
                    office_details__phone = ${this?.office_details?.phone ? `'${this.office_details.phone}'` : `NULL`},
                    first_name = :first_name
                WHERE
                    account_id = :account_id
            `, { ...this });



        } catch (error) {
            return Promise.reject({ code: 500, type: 'internal_server_error', message: error?.message || null });
        }

    }


    // delete the specific travel agent
    public async delete_travel_agent(): Promise<void> {

        try {

            const delete_result = await accountsDb.query(`DELETE FROM accounts WHERE account_id = :account_id`, { account_id: this.account_id });

        } catch (error) {
            return Promise.reject(error);
        }

    }




    // create a new plan
    public async createNewPLan(new_plan: TravelPlan, res: Response): Promise<any> {

        try {

            const insertion_result = await createNewPlan(new_plan);

            if (insertion_result.code === 400)
                return utilsService.systemErrorHandler(insertion_result, res);

            return res.status(200).send(insertion_result);


        } catch (error) {
            return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
        }

    }



    // update a new plan
    public async updateExistingPlan(existing_plan: TravelPlan, res: Response): Promise<any> {

        try {

            const insertion_result = await updateExistingPlan(existing_plan);

            if (insertion_result.code === 400)
                return utilsService.systemErrorHandler(insertion_result, res);

            return res.status(200).send(insertion_result);


        } catch (error) {
            return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
        }

    }



    // delete an existing plan
    public async deleteExistingPlan(plan_id: string, res: Response): Promise<any> {

        try {

            const deletion_result = await deleteExistingPlan(plan_id);

            return res.status(200).send(deletion_result);

        } catch (error) {
            return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
        }

    }




    // book a plan
    public async bookPlan(booking_details: PlanBooking, user: Account): Promise<any> {

        try {

            const insertion_result = await accountsDb.query(`
                INSERT INTO
                    bookings
                SET
                    booking_id = :booking_id,
                    plan_id = :plan_id,
                    travel_agent_id = :travel_agent_id,
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
    public async deleteBookingSelf(data: { account_id: string, booking_id: string }): Promise<void> {

        try {

            const result = await accountsDb.query(`DELETE FROM bookings WHERE booking_id = :booking_id`, data);

        } catch (error) {
            return Promise.reject(error);
        }

    }


}
