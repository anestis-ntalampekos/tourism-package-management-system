import { Application, Request, Response } from 'express';
import { accountsDb } from '../lib/connectors/db/accounts-db';
import { generateAccountData, registrationService } from '../lib/registration.service';
import { userExistsService } from '../lib/user.service';
import { config } from '../config';

import { utilsService } from '../lib/utils.service';

import { TravelAgent } from './TravelAgent';
import { mailServer } from '../lib/connectors/mailServer';
import { ActivateAccountEmailTemplate } from '../lib/email-templates/ActivateAccountEmailTemplate';
import { Customer } from './Customer';
import { TravelPlan } from './TravelPlan';
import { createNewPlan, deleteExistingPlan, updateExistingPlan } from '../lib/manage-plan.service';
import { Place } from './Place';
import { Accommodation } from './Accommodation';
import { PlanBooking } from './Booking';
import { Account } from './Account';



export class Secretariat {

    account_id?: string;
    secretariat_id?: string;
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

    office_hours?: {
        start_time: string;
        end_time: string;
    };

    office_details?: {
        email?: string;
        phone?: string;
    };

    updated_at?: string | Date;
    created_at?: string | Date;


    // not in db
    password?: string;
    username?: string;

    constructor(props?: Secretariat) {

        this.account_id = props?.account_id || null;
        this.secretariat_id = props?.secretariat_id || null;
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

        this.office_hours = props?.office_hours || null;

        this.updated_at = props?.updated_at || null;
        this.created_at = props?.created_at || null;


        this.password = props?.password || null;
        this.username = props?.username || null;

    }






    // register new customer
    public async register_customer(req: Request, res: Response): Promise<any> {

        const new_customer = new Customer();
        await new_customer.register(req, res);

    }

    // register new travel agent
    public async register_travel_agent(data: { new_travel_agent: TravelAgent }, req: Request, res: Response): Promise<any> {

        const new_travel_agent = new TravelAgent(data.new_travel_agent);



        if (!new_travel_agent?.first_name || !new_travel_agent?.last_name || !new_travel_agent?.email
            || !new_travel_agent?.phone || !new_travel_agent?.password || !new_travel_agent?.username)
            return utilsService.systemErrorHandler({ code: 400, type: 'bad_request', message: 'Credentials to register the user are missing' }, res);




        // check if the user exists
        try {

            if (await userExistsService.userExists({ username: new_travel_agent.username }))
                return utilsService.systemErrorHandler({ code: 401, type: 'username_exists', message: 'Username already exists' }, res);

            if (await userExistsService.userExists({ email: new_travel_agent.email }))
                return utilsService.systemErrorHandler({ code: 401, type: 'email_exists', message: 'Email already exists' }, res);

            if (await userExistsService.userExists({ phone: new_travel_agent.phone }))
                return utilsService.systemErrorHandler({ code: 401, type: 'phone_exists', message: 'Phone already exists' }, res);

        } catch (error) {
            return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
        }



        // check the password validation
        // if (new_travel_agent.password.length < 8 || new_travel_agent.password.length > 20)
        //     return utilsService.systemErrorHandler({ code: 402, type: 'password_out_of_range', message: 'Password length out of range' }, res);

        // if (registrationService.checkPassword(new_travel_agent.password))
        //     return utilsService.systemErrorHandler({ code: 402, type: 'password_not_strength', message: `Password doesn't meet the criteria` }, res);



        // hash the password
        new_travel_agent.password = utilsService.generateHash(new_travel_agent.password);



        // if checks not failed, save the new customer account
        try {

            new_travel_agent.account_id = utilsService.generateId({ alphabet: config.nanoid_basic_alphabet, length: config.account_id_length });
            const account_insertion_result = await accountsDb.query(`
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
                    account_type = 'travel_agent';
            `, new_travel_agent);



            // insert new travel agent
            const insert_travel_agent_result = await accountsDb.query(`
                INSERT INTO
                    travel_agents
                SET
                    account_id = :account_id,
                    first_name = :first_name,
                    last_name = :last_name,
                    email = :email,
                    phone = :phone,
                    ${new_travel_agent?.date_of_birth ? `date_of_birth = '${new_travel_agent.date_of_birth}',` : ``}
                    ${new_travel_agent?.id_number ? `id_number = '${new_travel_agent.id_number}',` : ``}
                    ${new_travel_agent?.id_type ? `id_type = '${new_travel_agent.id_type}',` : ``}
                    ${new_travel_agent?.place_of_residence?.street ? `place_of_residence__street = '${new_travel_agent.place_of_residence.street}',` : ``}
                    ${new_travel_agent?.place_of_residence?.city ? `place_of_residence__city = '${new_travel_agent.place_of_residence.city}',` : ``}
                    ${new_travel_agent?.place_of_residence?.postal_code ? `place_of_residence__postal_code = '${new_travel_agent.place_of_residence.postal_code}',` : ``}
                    ${new_travel_agent?.place_of_residence?.state ? `place_of_residence__state = '${new_travel_agent.place_of_residence.state}',` : ``}
                    ${new_travel_agent?.place_of_residence?.country ? `place_of_residence__country = '${new_travel_agent.place_of_residence.country}',` : ``}
                    ${new_travel_agent?.place_of_residence?.longitude ? `place_of_residence__longitude = ${new_travel_agent.place_of_residence.longitude},` : ``}
                    ${new_travel_agent?.place_of_residence?.latitude ? `place_of_residence__latitude = ${new_travel_agent.place_of_residence.latitude},` : ``}
                    ${new_travel_agent?.start_date ? `start_date = '${new_travel_agent.start_date}',` : ``}
                    ${new_travel_agent?.office_details?.email ? `office_details__email = '${new_travel_agent.office_details.email}',` : ``}
                    ${new_travel_agent?.office_details?.phone ? `office_details__phone = '${new_travel_agent.office_details.phone}',` : ``}
                    travel_agent_id = :travel_agent_id;
            `, {
                ...new_travel_agent,
                travel_agent_id: utilsService.generateId({ alphabet: config.nanoid_basic_alphabet, length: config.travel_agent_id_length }),
            });



            const activation_key = generateAccountData.getWebToken({
                account_id: new_travel_agent.account_id,
                username: new_travel_agent.username,
                email: new_travel_agent.email,
                account_type: 'travel_agent',
                type: 'activation_key'
            });


            const emailId = await mailServer.send_mail({
                to: [new_travel_agent.email],
                subject: 'Thank you for your register! Please activate your account!',
                html: new ActivateAccountEmailTemplate(activation_key).html
            });



            return res.status(200).send({ code: 200, type: 'new_travel_agent_registered', message: 'new_travel_agent_registered_successfully' });

        } catch (error) {
            return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
        }

    }

    // register new secretary
    public async register_secretary(data: { new_secretary: Secretariat }, req: Request, res: Response): Promise<any> {


        const new_secretary = new Secretariat(data.new_secretary);


        if (!new_secretary?.first_name || !new_secretary?.last_name || !new_secretary?.email || !new_secretary?.phone
            || !new_secretary?.password || !new_secretary?.username)
            return utilsService.systemErrorHandler({ code: 400, type: 'bad_request', message: 'Credentials to register the user are missing' }, res);




        // check if the user exists
        try {

            if (await userExistsService.userExists({ username: new_secretary.username }))
                return utilsService.systemErrorHandler({ code: 401, type: 'username_exists', message: 'Username already exists' }, res);

            if (await userExistsService.userExists({ email: new_secretary.email }))
                return utilsService.systemErrorHandler({ code: 401, type: 'email_exists', message: 'Email already exists' }, res);

            if (await userExistsService.userExists({ phone: new_secretary.phone }))
                return utilsService.systemErrorHandler({ code: 401, type: 'phone_exists', message: 'Phone already exists' }, res);

        } catch (error) {
            return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
        }



        // check the password validation
        // if (new_secretary.password.length < 8 || new_secretary.password.length > 20)
        //     return utilsService.systemErrorHandler({ code: 402, type: 'password_out_of_range', message: 'Password length out of range' }, res);

        // if (registrationService.checkPassword(new_secretary.password))
        //     return utilsService.systemErrorHandler({ code: 402, type: 'password_not_strength', message: `Password doesn't meet the criteria` }, res);



        // hash the password
        new_secretary.password = utilsService.generateHash(new_secretary.password);




        // if checks not failed, save the new customer account
        try {

            new_secretary.account_id = utilsService.generateId({ alphabet: config.nanoid_basic_alphabet, length: config.account_id_length });
            const account_insertion_result = await accountsDb.query(`
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
                    account_type = 'secretariat';
            `, new_secretary);



            // insert new travel agent
            const insert_travel_agent_result = await accountsDb.query(`
                INSERT INTO
                    secretariat
                SET
                    account_id = :account_id,
                    first_name = :first_name,
                    last_name = :last_name,
                    email = :email,
                    phone = :phone,
                    ${new_secretary?.date_of_birth ? `date_of_birth = '${new_secretary.date_of_birth}',` : ``}
                    ${new_secretary?.id_number ? `id_number = '${new_secretary.id_number}',` : ``}
                    ${new_secretary?.id_type ? `id_type = '${new_secretary.id_type}',` : ``}
                    ${new_secretary?.place_of_residence?.street ? `place_of_residence__street = '${new_secretary.place_of_residence.street}',` : ``}
                    ${new_secretary?.place_of_residence?.city ? `place_of_residence__city = '${new_secretary.place_of_residence.city}',` : ``}
                    ${new_secretary?.place_of_residence?.postal_code ? `place_of_residence__postal_code = '${new_secretary.place_of_residence.postal_code}',` : ``}
                    ${new_secretary?.place_of_residence?.state ? `place_of_residence__state = '${new_secretary.place_of_residence.state}',` : ``}
                    ${new_secretary?.place_of_residence?.country ? `place_of_residence__country = '${new_secretary.place_of_residence.country}',` : ``}
                    ${new_secretary?.place_of_residence?.longitude ? `place_of_residence__longitude = ${new_secretary.place_of_residence.longitude},` : ``}
                    ${new_secretary?.place_of_residence?.latitude ? `place_of_residence__latitude = ${new_secretary.place_of_residence.latitude},` : ``}
                    ${new_secretary?.start_date ? `start_date = '${new_secretary.start_date}',` : ``}
                    still_working = ${new_secretary.still_working ? 1 : 0},
                    ${new_secretary?.office_hours?.start_time ? `office_hours__start_time = '${new_secretary.office_hours.start_time}',` : ``}
                    ${new_secretary?.office_hours?.end_time ? `office_hours__end_time = '${new_secretary.office_hours.end_time}',` : ``}
                    ${new_secretary?.office_details?.email ? `office_details__email = '${new_secretary.office_details.email}',` : ``}
                    ${new_secretary?.office_details?.phone ? `office_details__phone = '${new_secretary.office_details.phone}',` : ``}
                    secretariat_id = :secretariat_id
            `, {
                ...new_secretary,
                secretariat_id: utilsService.generateId({ alphabet: config.nanoid_basic_alphabet, length: config.secretariat_id_length }),
            });



            const activation_key = generateAccountData.getWebToken({
                account_id: new_secretary.account_id,
                username: new_secretary.username,
                email: new_secretary.email,
                account_type: 'travel_agent',
                type: 'activation_key'
            });


            const emailId = await mailServer.send_mail({
                to: [new_secretary.email],
                subject: 'Thank you for your register! Please activate your account!',
                html: new ActivateAccountEmailTemplate(activation_key).html
            });


            return res.status(200).send({ code: 200, type: 'new_secretary_registered', message: 'new_secretary_registered_successfully' });

        } catch (error) {
            return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
        }


    }




    // log out
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



    // activate secretariat
    public async activate_secretary(data: { account_id: string }, req: Request, res: Response): Promise<void> {

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



    // update the secretary
    public async update_secretary(): Promise<void> {

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
                    secretariat
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
                    office_hours__start_time = ${this?.office_hours?.start_time ? `'${this.office_hours.start_time}'` : `NULL`},
                    office_hours__end_time = ${this?.office_hours?.end_time ? `'${this.office_hours.end_time}'` : `NULL`},
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


    // delete secretary account
    public async delete_secretary(): Promise<void> {

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




    // update an existing plan
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



    // new place
    public async newPlace(new_place: Place): Promise<any> {


        if (!new_place?.country || !new_place?.city || !new_place?.postal_code || !new_place?.state)
            return Promise.resolve({ code: 400, type: 'missing_data' });



        try {

            new_place.place_id = utilsService.generateId({ alphabet: config.nanoid_basic_alphabet, length: config.place_id_length });
            const insertion_result = await accountsDb.query(`
                INSERT INTO
                    places
                SET
                    country = :country,
                    city = :city,
                    postal_code = :postal_code,
                    state = :state,
                    ${new_place?.street ? `street = '${new_place.street}',` : ``}
                    ${new_place?.longitude ? `longitude = '${new_place.longitude}',` : ``}
                    ${new_place?.latitude ? `latitude = '${new_place.latitude}',` : ``}
                    place_id = :place_id
            `, new_place);


            return Promise.resolve({ code: 200, type: 'new_place_inserted' });

        } catch (error) {
            return Promise.reject(error);
        }


    }



    // update existing place
    public async updateExistingPlace(existing_place: Place): Promise<any> {

        if (!existing_place?.place_id || !existing_place?.country || !existing_place?.city || !existing_place?.postal_code || !existing_place?.state)
            return Promise.resolve({ code: 400, type: 'missing_data' });



        try {

            const update_result = await accountsDb.query(`
                UPDATE
                    places
                SET
                    country = :country,
                    city = :city,
                    postal_code = :postal_code,
                    state = :state,
                    street = ${existing_place?.street ? `'${existing_place.street}'` : `NULL`},
                    longitude = ${existing_place?.longitude ? `'${existing_place.longitude}'` : `NULL`},
                    latitude = ${existing_place?.latitude ? `'${existing_place.latitude}'` : `NULL`},
                    place_id = :place_id
                WHERE
                    place_id = :place_id;
            `, existing_place);


            return Promise.resolve({ code: 200, type: 'place_updated' });

        } catch (error) {
            return Promise.reject(error);
        }

    }



    // delete existing place
    public async deleteExistingPlace(place_id: string): Promise<any> {

        try {

            const deletion_result = await accountsDb.query(`DELETE FROM places WHERE place_id = :place_id`, { place_id: place_id });

            return Promise.resolve({ code: 200, type: 'place_deleted' });

        } catch (error) {
            return Promise.reject(error);
        }

    }




    // new accommodation
    public async addNewAccommodation(new_accommodation: Accommodation): Promise<any> {

        if (!new_accommodation?.title || !new_accommodation?.title || !new_accommodation?.type || !new_accommodation?.place_id)
            return Promise.resolve({ code: 400, type: 'missing_data' });



        try {

            new_accommodation.accommodation_id = utilsService.generateId({ alphabet: config.nanoid_basic_alphabet, length: config.accommodation_id_length });
            const insertion_result = await accountsDb.query(`
                INSERT INTO
                    accommodations
                SET
                    accommodation_id = :accommodation_id,
                    place_id = :place_id,
                    title = :title,
                    title_internal = :title_internal,
                    type = :type,
                    ${new_accommodation?.location_details?.street ? `location_details__street = '${new_accommodation.location_details.street}',` : ``}
                    ${new_accommodation?.location_details?.city ? `location_details__city = '${new_accommodation.location_details.city}',` : ``}
                    ${new_accommodation?.location_details?.postal_code ? `location_details__postal_code = '${new_accommodation.location_details.postal_code}',` : ``}
                    ${new_accommodation?.location_details?.state ? `location_details__state = '${new_accommodation.location_details.state}',` : ``}
                    ${new_accommodation?.location_details?.country ? `location_details__country = '${new_accommodation.location_details.country}',` : ``}
                    ${new_accommodation?.location_details?.longitude ? `location_details__longitude = '${new_accommodation.location_details.longitude}',` : ``}
                    ${new_accommodation?.location_details?.latitude ? `location_details__latitude = '${new_accommodation.location_details.latitude}',` : ``}
                    accept_adults = ${new_accommodation?.accept_adults ? 1 : 0},
                    accept_children = ${new_accommodation?.accept_children ? 1 : 0},
                    accept_infants = ${new_accommodation?.accept_infants ? 1 : 0};
            `, new_accommodation);


            return Promise.resolve({ code: 200, type: 'new_accommodation_inserted' });

        } catch (error) {
            return Promise.reject(error);
        }

    }



    // update existing accommodation
    public async updateExistingAccommodation(existing_accommodation: Accommodation): Promise<any> {

        if (!existing_accommodation?.title || !existing_accommodation?.title || !existing_accommodation?.type || !existing_accommodation?.place_id)
            return Promise.resolve({ code: 400, type: 'missing_data' });



        try {

            existing_accommodation.accommodation_id = utilsService.generateId({ alphabet: config.nanoid_basic_alphabet, length: config.accommodation_id_length });
            const insertion_result = await accountsDb.query(`
                UPDATE
                    accommodations
                SET
                    accommodation_id = :accommodation_id,
                    title = :title,
                    title_internal = :title_internal,
                    type = :type,
                    location_details__street = ${existing_accommodation?.location_details?.street ? `'${existing_accommodation.location_details.street}'` : `NULL`},
                    location_details__city = ${existing_accommodation?.location_details?.city ? `'${existing_accommodation.location_details.city}'` : `NULL`},
                    location_details__postal_code = ${existing_accommodation?.location_details?.postal_code ? `'${existing_accommodation.location_details.postal_code}'` : `NULL`},
                    location_details__state = ${existing_accommodation?.location_details?.state ? `'${existing_accommodation.location_details.state}'` : `NULL`},
                    location_details__country = ${existing_accommodation?.location_details?.country ? `'${existing_accommodation.location_details.country}'` : `NULL`},
                    location_details__longitude = ${existing_accommodation?.location_details?.longitude ? `${existing_accommodation.location_details.longitude}` : `NULL`},
                    location_details__latitude = ${existing_accommodation?.location_details?.latitude ? `${existing_accommodation.location_details.latitude}` : `NULL`},
                    accept_adults = ${existing_accommodation?.accept_adults ? 1 : 0},
                    accept_children = ${existing_accommodation?.accept_children ? 1 : 0},
                    accept_infants = ${existing_accommodation?.accept_infants ? 1 : 0}
                WHERE
                    accommodation_id = :accommodation_id
            `, existing_accommodation);


            return Promise.resolve({ code: 200, type: 'accommodation_updated' });

        } catch (error) {
            return Promise.reject(error);
        }

    }



    // delete existing accommodation
    public async deleteExistingAccommodation(accommodation_id: string): Promise<any> {

        try {

            const deletion_result = await accountsDb.query(`DELETE FROM accommodations WHERE accommodation_id = :accommodation_id`, { accommodation_id: accommodation_id });

            return Promise.resolve({ code: 200, type: 'accommodation_deleted' });

        } catch (error) {
            return Promise.reject(error);
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
                    secretary_id = :secretary_id,
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


    // book a plan for a customer
    public async bookPlanForCustomer(booking_details: PlanBooking): Promise<any> {

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
