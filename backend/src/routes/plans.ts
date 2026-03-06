import { Application, Request, Response } from 'express';
import { config } from '../config';

import { utilsService } from '../lib/utils.service';
import { Accommodation, Place, Secretariat, TravelAgent, TravelPlan } from '../models';

import { accountsDb } from '../lib/connectors/db/accounts-db';

import { createNewPlan } from '../lib/manage-plan.service';



export class PlansRoutes {


    public routes(app: Application) {



        app.route('/api/plans')
            .get(async (req: Request, res: Response) => {

                const plans_list: TravelPlan[] = [];


                try {


                    const plans_list_result = await accountsDb.query(`
                        SELECT
                            plans.*,
                            places.country as place__country,
                            places.city as place__city,
                            places.postal_code as place__postal_code,
                            places.state as place__state,
                            places.street as place__street,
                            places.longitude as place__longitude,
                            places.latitude as place__latitude,
                            accommodations.title as accommodation__title,
                            accommodations.title_internal as accommodation__title_internal,
                            accommodations.type as accommodation__type,
                            accommodations.location_details__street as accommodation__location_details__street,
                            accommodations.location_details__city as accommodation__location_details__city,
                            accommodations.location_details__postal_code as accommodation__location_details__postal_code,
                            accommodations.location_details__state as accommodation__location_details__state,
                            accommodations.location_details__country as accommodation__location_details__country,
                            accommodations.location_details__longitude as accommodation__location_details__longitude,
                            accommodations.location_details__latitude as accommodation__location_details__latitude,
                            accommodations.accept_adults as accommodation__accept_adults,
                            accommodations.accept_children as accommodation__accept_children,
                            accommodations.accept_infants as accommodation__accept_infants
                        FROM
                            plans
                        JOIN places ON plans.place_id = places.place_id
                        JOIN accommodations ON plans.accommodation_id = accommodations.accommodation_id;
                    `);



                    for (const row of plans_list_result.rows)
                        plans_list.push(new TravelPlan({
                            ...row,
                            means_of_transport_arrival: {
                                type: row['means_of_transport_arrival__type'],
                                company_name: row['means_of_transport_arrival__company_name'],
                                start_time: row['means_of_transport_arrival__start_time'],
                                arrival_time: row['means_of_transport_arrival__arrival_time'],
                                number: row['means_of_transport_arrival__number'],
                            },
                            means_of_transport_return: {
                                type: row['means_of_transport_return__type'],
                                company_name: row['means_of_transport_return__company_name'],
                                start_time: row['means_of_transport_return__start_time'],
                                arrival_time: row['means_of_transport_return__arrival_time'],
                                number: row['means_of_transport_return__number'],
                            },
                            discount: {
                                code_type: row['discount__code_type'],
                                code_value: row['discount__code_value'],
                                enabled: row['discount__enabled'],
                                type: row['discount__type'],
                                value: row['discount__value']
                            },
                            place_details: new Place({
                                country: row['place__country'],
                                city: row['place__city'],
                                postal_code: row['place__postal_code'],
                                state: row['place__state'],
                                street: row['place__street'],
                                longitude: row['place__longitude'],
                                latitude: row['place__latitude']
                            }),
                            accommodation_details: new Accommodation({
                                title: row['accommodation__title'],
                                title_internal: row['accommodation__title_internal'],
                                type: row['accommodation__type'],
                                location_details: {
                                    street: row['accommodation__location_details__street'],
                                    city: row['accommodation__location_details__city'],
                                    postal_code: row['accommodation__location_details__postal_code'],
                                    state: row['accommodation__location_details__state'],
                                    country: row['accommodation__location_details__country'],
                                    longitude: row['accommodation__location_details__longitude'],
                                    latitude: row['accommodation__location_details__latitude'],
                                },
                                accept_adults: row['accommodation__accept_adults'],
                                accept_children: row['accommodation__accept_children'],
                                accept_infants: row['accommodation__accept_infants'],
                            }),
                        }));




                    return res.status(200).send(plans_list);


                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            });





        // add a new plan
        app.route('/api/plans/new')
            .post(async (req: Request, res: Response) => {

                const new_plan = new TravelPlan(req.body.plan);
                const user = req?.session?.user || req?.body?.user || null;


                if (user.user.account_type === 'secretariat') {
                    const sec_plain = req?.session?.user?.account_id ? req.session.secretary : req?.body?.user?.account_id ? req.body.secretariat_data : null;
                    const secretary = new Secretariat(sec_plain);
                    return secretary.createNewPLan(new_plan, res);

                } else if (user.user.account_type === 'travel_agent') {

                    const travel_agent_plain = req?.session?.user?.account_id ? req.session.travel_agent : req?.body?.user?.account_id ? req.body.travel_agent : null;
                    const travel_agent = new TravelAgent(travel_agent_plain);
                    return travel_agent.createNewPLan(new_plan, res);

                }



                return utilsService.systemErrorHandler({
                    code: 500,
                    type: 'wrong_action'
                }, res);

            });




        // specific plan
        app.route('/api/plans/p/:plan_id')
            .get(async (req: Request, res: Response) => {

                const plan_id = req.params.plan_id.toString();


                try {

                    const plan_result = await accountsDb.query(`
                        SELECT
                            plans.*,
                            places.country as place__country,
                            places.city as place__city,
                            places.postal_code as place__postal_code,
                            places.state as place__state,
                            places.street as place__street,
                            places.longitude as place__longitude,
                            places.latitude as place__latitude,
                            accommodations.title as accommodation__title,
                            accommodations.title_internal as accommodation__title_internal,
                            accommodations.type as accommodation__type,
                            accommodations.location_details__street as accommodation__location_details__street,
                            accommodations.location_details__city as accommodation__location_details__city,
                            accommodations.location_details__postal_code as accommodation__location_details__postal_code,
                            accommodations.location_details__state as accommodation__location_details__state,
                            accommodations.location_details__country as accommodation__location_details__country,
                            accommodations.location_details__longitude as accommodation__location_details__longitude,
                            accommodations.location_details__latitude as accommodation__location_details__latitude,
                            accommodations.accept_adults as accommodation__accept_adults,
                            accommodations.accept_children as accommodation__accept_children,
                            accommodations.accept_infants as accommodation__accept_infants
                        FROM
                            plans
                        JOIN places ON plans.place_id = places.place_id
                        JOIN accommodations ON plans.accommodation_id = accommodations.accommodation_id
                        WHERE
                            plan_id = :plan_id;
                    `, { plan_id: plan_id });


                    if (plan_result.rowsCount === 0)
                        return res.status(200).send(null);



                    return res.status(200).send(new TravelPlan({
                        ...plan_result.rows[0],
                        means_of_transport_arrival: {
                            type: plan_result.rows[0]['means_of_transport_arrival__type'],
                            company_name: plan_result.rows[0]['means_of_transport_arrival__company_name'],
                            start_time: plan_result.rows[0]['means_of_transport_arrival__start_time'],
                            arrival_time: plan_result.rows[0]['means_of_transport_arrival__arrival_time'],
                            number: plan_result.rows[0]['means_of_transport_arrival__number'],
                        },
                        means_of_transport_return: {
                            type: plan_result.rows[0]['means_of_transport_return__type'],
                            company_name: plan_result.rows[0]['means_of_transport_return__company_name'],
                            start_time: plan_result.rows[0]['means_of_transport_return__start_time'],
                            arrival_time: plan_result.rows[0]['means_of_transport_return__arrival_time'],
                            number: plan_result.rows[0]['means_of_transport_return__number'],
                        },
                        discount: {
                            code_type: plan_result.rows[0]['discount__code_type'],
                            code_value: plan_result.rows[0]['discount__code_value'],
                            enabled: plan_result.rows[0]['discount__enabled'],
                            type: plan_result.rows[0]['discount__type'],
                            value: plan_result.rows[0]['discount__value']
                        },
                        place_details: new Place({
                            country: plan_result.rows[0]['place__country'],
                            city: plan_result.rows[0]['place__city'],
                            postal_code: plan_result.rows[0]['place__postal_code'],
                            state: plan_result.rows[0]['place__state'],
                            street: plan_result.rows[0]['place__street'],
                            longitude: plan_result.rows[0]['place__longitude'],
                            latitude: plan_result.rows[0]['place__latitude']
                        }),
                        accommodation_details: new Accommodation({
                            title: plan_result.rows[0]['accommodation__title'],
                            title_internal: plan_result.rows[0]['accommodation__title_internal'],
                            type: plan_result.rows[0]['accommodation__type'],
                            location_details: {
                                street: plan_result.rows[0]['accommodation__location_details__street'],
                                city: plan_result.rows[0]['accommodation__location_details__city'],
                                postal_code: plan_result.rows[0]['accommodation__location_details__postal_code'],
                                state: plan_result.rows[0]['accommodation__location_details__state'],
                                country: plan_result.rows[0]['accommodation__location_details__country'],
                                longitude: plan_result.rows[0]['accommodation__location_details__longitude'],
                                latitude: plan_result.rows[0]['accommodation__location_details__latitude'],
                            },
                            accept_adults: plan_result.rows[0]['accommodation__accept_adults'],
                            accept_children: plan_result.rows[0]['accommodation__accept_children'],
                            accept_infants: plan_result.rows[0]['accommodation__accept_infants'],
                        }),
                    }));


                } catch (error) {
                    return utilsService.systemErrorHandler({ code: 500, type: 'internal_server_error', message: error?.message || null }, res);
                }

            })
            .put(async (req: Request, res: Response) => {

                const existing_plan = new TravelPlan(req.body.plan);
                existing_plan.plan_id = req.params.plan_id.toString();

                const user = req?.session?.user || req?.body?.user || null;


                if (user.user.account_type === 'secretariat') {

                    const sec_plain = req?.session?.user?.account_id ? req.session.secretary : req?.body?.user?.account_id ? req.body.secretariat_data : null;
                    const secretary = new Secretariat(sec_plain);
                    return secretary.updateExistingPlan(existing_plan, res);

                } else if (user.user.account_type === 'travel_agent') {

                    const travel_agent_plain = req?.session?.user?.account_id ? req.session.travel_agent : req?.body?.user?.account_id ? req.body.travel_agent : null;
                    const travel_agent = new TravelAgent(travel_agent_plain);
                    return travel_agent.updateExistingPlan(existing_plan, res);

                }



                return utilsService.systemErrorHandler({
                    code: 500,
                    type: 'wrong_action'
                }, res);


            })
            .delete(async (req: Request, res: Response) => {

                const plan_id = req.params.plan_id.toString();

                const user = req?.session?.user || req?.body?.user || null;



                if (user.account_type === 'secretariat') {

                    const secretary = new Secretariat();
                    return secretary.deleteExistingPlan(plan_id, res);

                } else if (user.account_type === 'travel_agent') {

                    const travel_agent = new TravelAgent();
                    return travel_agent.deleteExistingPlan(plan_id, res);

                }



                return utilsService.systemErrorHandler({
                    code: 500,
                    type: 'wrong_action'
                }, res);

            });



    }


}
