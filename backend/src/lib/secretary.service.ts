import { Request } from 'express';
import { accountsDb } from './connectors/db/accounts-db';
import { Secretariat } from '../models';


class SecretaryGetService {


    async getSecretary(account_id: string): Promise<Secretariat> {

        try {

            const result = await accountsDb.query(`SELECT * FROM secretariat WHERE account_id = :account_id`, { account_id: account_id });
            if (result.rowsCount === 0)
                return Promise.resolve(null);

            const row = result.rows[0];
            const secretary = new Secretariat({
                ...row,
                place_of_residence: {
                    street: row['place_of_residence__street'],
                    city: row['place_of_residence__city'],
                    postal_code: row['place_of_residence__postal_code'],
                    state: row['place_of_residence__state'],
                    country: row['place_of_residence__country'],
                    longitude: row['place_of_residence__longitude'],
                    latitude: row['place_of_residence__latitude'],
                },
                office_hours: {
                    start_time: row['office_hours__start_time'],
                    end_time: row['office_hours__end_time']
                },
                office_details: {
                    email: row['office_details__email'],
                    phone: row['office_details__phone']
                }
            });
            return Promise.resolve(secretary);

        } catch (error) {
            return Promise.reject(error);
        }

    }





    async secretaryExists(account_id: string): Promise<boolean> {

        try {

            const result = await accountsDb.query(`SELECT account_id FROM secretariat WHERE account_id = :account_id`, { account_id: account_id });
            if (result.rowsCount === 0)
                return Promise.resolve(false);

            return Promise.resolve(true);

        } catch (error) {
            return Promise.reject(error);
        }

    }


}




export const secretaryGetService = new SecretaryGetService();
