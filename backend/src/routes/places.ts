import { Application, Request, Response } from 'express';
import { config } from '../config';

import { utilsService } from '../lib/utils.service';
import { Place, Secretariat, TravelAgent, TravelPlan } from '../models';

import { accountsDb } from '../lib/connectors/db/accounts-db';




export class PlacesRoutes {


    public routes(app: Application) {


        app.route('/api/places')
            .get(async (req: Request, res: Response) => {


                const places_list: Place[] = [];


                try {

                    const result = await accountsDb.query(`SELECT * FROM places`);

                    for (const row of result.rows)
                        places_list.push(new Place(row));


                    return res.status(200).send(places_list);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }


            });






        app.route('/api/places/new')
            .post(async (req: Request, res: Response) => {

                const new_place = new Place(req.body.place);

                const secretary = new Secretariat(req?.session?.secretary || req?.body?.secretary || null);



                try {

                    const response = await secretary.newPlace(new_place);


                    if (response.code === 200)
                        return res.status(200).send(response);


                    return utilsService.systemErrorHandler(response, res);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            });




        // specific place manage
        app.route('/api/places/pl/:place_id')
            .get(async (req: Request, res: Response) => {

                const place_id = req.params.place_id.toString();


                try {

                    const place_result = await accountsDb.query(`SELECT * FROM places WHERE place_id = :place_id`, { place_id: place_id });

                    if (place_result.rowsCount === 0)
                        return res.status(200).send(null);


                    return res.status(200).send(place_result.rows[0]);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            })
            .put(utilsService.checkAuthSecretary, async (req: Request, res: Response) => {

                const existing_place = new Place(req.body);
                existing_place.place_id = req.params.place_id.toString();


                const secretary = new Secretariat(req.session.secretary);



                try {

                    const response = await secretary.updateExistingPlace(existing_place);


                    if (response.code === 200)
                        return res.status(200).send(response);


                    return utilsService.systemErrorHandler(response, res);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }


            })
            .delete(utilsService.checkAuthSecretary, async (req: Request, res: Response) => {

                const place_id = req.params.place_id.toString();
                const secretary = new Secretariat(req.session.secretary);


                try {

                    const response = await secretary.deleteExistingPlace(place_id);
                    return res.status(200).send(response);

                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            });


    }


}
