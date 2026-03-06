import { Application, Request, Response } from 'express';
import { utilsService } from '../lib/utils.service';
import { Customer, Secretariat } from '../models';
import { accountsDb } from '../lib/connectors/db/accounts-db';

import { customerGetService } from '../lib/customer.service';



export class CustomerManagementRoutes {


    public routes(app: Application) {



        // create new customer using a secretary account
        app.route('/api/customers/new')
            .post(utilsService.checkAuthSecretary, async (req: Request, res: Response) => {

                const secretary = new Secretariat(req.session.secretary);
                return secretary.register_customer(req, res);

            });



        // get all customers
        app.route('/api/customers')
            .get(async (req: Request, res: Response) => {

                const customers: Customer[] = [];

                try {

                    const result = await accountsDb.query(`SELECT * FROM customers`);

                    for (const row of result.rows)
                        customers.push(new Customer({
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
                        }));


                    return res.status(200).send(customers);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            });




        // specific customer
        app.route('/api/customers/c/:account_id')
            .get(utilsService.checkAuth, async (req: Request, res: Response) => {

                const account_id = req.params.account_id.toString();

                try {

                    const customer = new Customer(await customerGetService.getCustomer(account_id));
                    return res.status(200).send(customer);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            })
            .put(utilsService.checkAuth, async (req: Request, res: Response) => {

                const account_id = req.params.account_id.toString();

                if (account_id !== req.session.user.account_id && req.session.user.account_type !== 'secretariat')
                    return utilsService.systemErrorHandler({ code: 401, type: 'unauthorized_for_this_action' }, res);


                let customer: Customer;
                if (account_id !== req.session.user.account_id)
                    customer = new Customer(req.session.customer);
                else
                    customer = new Customer(await customerGetService.getCustomer(account_id));



                try {

                    await customer.update_customer();
                    return res.status(200).send({ code: 200, type: 'customer_updated_successfully' });

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            })
            .delete(utilsService.checkAuth, async (req: Request, res: Response) => {

                const account_id = req.params.account_id.toString();

                if (account_id !== req.session.user.account_id && req.session.user.account_type !== 'secretariat')
                    return utilsService.systemErrorHandler({ code: 401, type: 'unauthorized_for_this_action' }, res);


                let customer: Customer;
                if (account_id !== req.session.user.account_id)
                    customer = new Customer(req.session.customer);
                else
                    customer = new Customer(await customerGetService.getCustomer(account_id));



                // delete customer
                try {
                    await customer.delete_customer();
                    return res.status(200).send({ code: 200, type: 'customer_deleted' });
                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            });


    }


}
