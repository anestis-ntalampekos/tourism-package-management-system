import { Request } from 'express';
import { accountsDb } from './connectors/db/accounts-db';
import { Customer, Secretariat } from '../models';



class CustomerGetService {


    async getCustomer(account_id: string): Promise<Customer> {

        try {

            const result = await accountsDb.query(`SELECT * FROM customers WHERE account_id = :account_id`, { account_id: account_id });
            if (result.rowsCount === 0)
                return Promise.resolve(null);

            const row = result.rows[0];
            const customer = new Customer({
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
            });
            return Promise.resolve(customer);

        } catch (error) {
            return Promise.reject(error);
        }

    }



    async customerExists(account_id: string): Promise<boolean> {

        try {

            const result = await accountsDb.query(`SELECT account_id FROM customers WHERE account_id = :account_id`, { account_id: account_id });
            if (result.rowsCount === 0)
                return Promise.resolve(false);

            return Promise.resolve(true);

        } catch (error) {
            return Promise.reject(error);
        }

    }



}




export const customerGetService = new CustomerGetService();
