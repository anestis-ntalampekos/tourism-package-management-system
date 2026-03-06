import { Application, Request, Response } from 'express';
import { utilsService } from '../lib/utils.service';



export class IndexRoutes {

    public routes(app: Application): void {


        app.route('/')
            .get(async (req: Request, res: Response) => {

                if (req?.session?.user?.account_id)
                    return res.status(200).send({
                        message: 'You are successfully authenticated to use the system!',
                        user: req.session.user,
                        session: req.session,
                        hash: utilsService.generateHash(req.query.hash.toString())
                    });

                return res.status(200).send({
                    message: 'Hi, you are unauthorized to have access in this system!',
                    hash: utilsService.generateHash(req.query.hash.toString())
                });

            });


        app.route('/hash')
            .get((req: Request, res: Response) => {

                return res.status(200).send({
                    hash: utilsService.generateHash(req.query.h.toString())
                });

            });

    }

}
