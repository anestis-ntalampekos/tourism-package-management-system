import { Application, Request, Response } from 'express';
import { utilsService } from '../lib/utils.service';
import { TravelAgent, Secretariat } from '../models';

import { secretaryGetService } from '../lib/secretary.service';
import { accountsDb } from '../lib/connectors/db/accounts-db';


export class SecretaryManagementRoutes {


    public routes(app: Application) {


        // create a new secretary account
        app.route('/api/secretaries/new')
            .post(utilsService.checkAuthSecretary, async (req: Request, res: Response) => {

                const secretary = new Secretariat(req.session.secretary);
                return secretary.register_secretary({ new_secretary: req.body.secretary }, req, res);

            });




        // get all secretaries
        app.route('/api/secretaries')
            .get(utilsService.checkAuthSecretary, async (req: Request, res: Response) => {

                const secretaries: Secretariat[] = [];

                try {

                    const result = await accountsDb.query(`SELECT * FROM secretariat`);

                    for (const row of result.rows)
                        secretaries.push(new Secretariat({
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
                        }));


                    return res.status(200).send(secretaries);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            });




        // specific secretary
        app.route('/api/secretaries/s/:account_id')
            .get(async (req: Request, res: Response) => {

                const account_id = req.params.account_id.toString();

                try {

                    const secretary = new Secretariat(await secretaryGetService.getSecretary(account_id));
                    return res.status(200).send(secretary);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            })
            .put(utilsService.checkAuthSecretary, async (req: Request, res: Response) => {

                const account_id = req.params.account_id.toString();
                const secretary = new Secretariat(req.body.secretary);


                try {

                    if (!await secretaryGetService.secretaryExists(account_id))
                        return utilsService.systemErrorHandler({ code: 404, type: 'user_not_found' }, res);

                } catch (error) {
                    return utilsService.systemErrorHandler(error, res);
                }


                try {

                    await secretary.update_secretary();

                    return res.status(200).send({ code: 200, type: 'secretary_updated' });

                } catch (error) {
                    return utilsService.systemErrorHandler(error, res);
                }

            })
            .delete(utilsService.checkAuthSecretary, async (req: Request, res: Response) => {

                const account_id = req.params.account_id.toString();
                const secretary = new Secretariat(req.body.secretary);


                try {

                    if (!await secretaryGetService.secretaryExists(account_id))
                        return utilsService.systemErrorHandler({ code: 404, type: 'user_not_found' }, res);

                } catch (error) {
                    return utilsService.systemErrorHandler(error, res);
                }



                try {

                    await secretary.delete_secretary();

                    return res.status(200).send({ code: 200, type: 'secretary_account_deleted' });

                } catch (error) {
                    return utilsService.systemErrorHandler(error, res);
                }

            });


    }


}
