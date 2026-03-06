import { Application, Request, Response } from 'express';
import { config } from '../config';

import { utilsService } from '../lib/utils.service';
import { Accommodation, Place, Secretariat, TravelAgent, TravelPlan } from '../models';

import { accountsDb } from '../lib/connectors/db/accounts-db';



export class AccommodationRoutes {


    public routes(app: Application) {


        app.route('/api/accommodations')
            .get(async (req: Request, res: Response) => {

                const accommodations_list: Accommodation[] = [];


                try {

                    const result = await accountsDb.query(`SELECT * FROM accommodations`);

                    for (const row of result.rows)
                        accommodations_list.push(new Accommodation({
                            location_details: {
                                street: row['location_details__street'],
                                city: row['location_details__city'],
                                postal_code: row['location_details__postal_code'],
                                state: row['location_details__state'],
                                country: row['location_details__country'],
                                longitude: row['location_details__longitude'],
                                latitude: row['location_details__latitude']
                            },
                            ...row
                        }));


                    return res.status(200).send(accommodations_list);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }


            });





        app.route('/api/accommodations/specific-list/:place_id')
            .get(async (req: Request, res: Response) => {

                const place_id = req.params.place_id.toString();
                const accommodations_list: Accommodation[] = [];


                try {

                    const result = await accountsDb.query(`SELECT * FROM accommodations WHERE place_id = :place_id`, { place_id: place_id });

                    for (const row of result.rows)
                        accommodations_list.push(new Accommodation({
                            location_details: {
                                street: row['location_details__street'],
                                city: row['location_details__city'],
                                postal_code: row['location_details__postal_code'],
                                state: row['location_details__state'],
                                country: row['location_details__country'],
                                longitude: row['location_details__longitude'],
                                latitude: row['location_details__latitude']
                            },
                            ...row
                        }));


                    return res.status(200).send(accommodations_list);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            });




        app.route('/api/accommodations/new')
            .post(async (req: Request, res: Response) => {

                const new_accommodation = new Accommodation(req.body.accommodation);

                const secretary = new Secretariat(req?.session?.secretary || req?.body?.secretary || null);


                try {

                    const response = await secretary.addNewAccommodation(new_accommodation);

                    if (response.code === 200)
                        return res.status(200).send(response);


                    return utilsService.systemErrorHandler(response, res);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            });




        // specific accommodation
        app.route('/api/accommodations/acm/:accommodation_id')
            .get(async (req: Request, res: Response) => {

                const accommodation_id = req.params.accommodation_id.toString();


                try {

                    const accommodation_result = await accountsDb.query(`SELECT * FROM accommodations WHERE accommodation_id = :accommodation_id`, { accommodation_id: accommodation_id });

                    if (accommodation_result.rowsCount === 0)
                        return res.status(200).send(null);


                    return res.status(200).send(new Accommodation({
                        location_details: {
                            street: accommodation_result.rows[0]['location_details__street'],
                            city: accommodation_result.rows[0]['location_details__city'],
                            postal_code: accommodation_result.rows[0]['location_details__postal_code'],
                            state: accommodation_result.rows[0]['location_details__state'],
                            country: accommodation_result.rows[0]['location_details__country'],
                            longitude: accommodation_result.rows[0]['location_details__longitude'],
                            latitude: accommodation_result.rows[0]['location_details__latitude']
                        },
                        ...accommodation_result.rows[0]
                    }));

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            })
            .put(utilsService.checkAuthSecretary, async (req: Request, res: Response) => {

                const existing_accommodation = new Accommodation(req.body);
                existing_accommodation.accommodation_id = req.params.accommodation_id.toString();


                const secretary = new Secretariat(req.session.secretary);



                try {

                    const response = await secretary.updateExistingAccommodation(existing_accommodation);

                    if (response.code === 200)
                        return res.status(200).send(response);


                    return utilsService.systemErrorHandler(response, res);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            })
            .delete(utilsService.checkAuthSecretary, async (req: Request, res: Response) => {

                const accommodation_id = req.params.accommodation_id.toString();
                const secretary = new Secretariat(req.session.secretary);


                try {

                    const response = await secretary.deleteExistingAccommodation(accommodation_id);
                    return res.status(200).send(response);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            });


    }


}
