import { Request, Response, NextFunction, query } from 'express';
import { customAlphabet } from 'nanoid';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment-timezone';
import * as lodash from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { accountsDb } from './connectors/db/accounts-db';
require('dotenv').config();




class UtilsService {

    public moment = moment;
    public lodash = lodash;
    public path = path;
    public fs = fs;



    /** Generates hashed version of a string (e.g. hash of user's password)  */
    generateHash(value: string): string {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(value, salt);
        return hash;
    }



    // id generator
    generateId(params: { alphabet: string, length: number }): string {
        const nanoid = customAlphabet(params.alphabet, params.length);
        return nanoid();
    }



    /** Middleware function for checking if user's session exist */
    checkAuth(req: Request, res: Response, next: NextFunction) {

        // if (config.unauthorized_routes_allowed.includes(req.path))
        //     return next();

        if (!req.session?.user?.account_id)
            return res.status(401).send({ code: 401, type: 'unauthorized', message: 'Please sign in' });

        next();

    }



    checkAuthSecretary(req: Request, res: Response, next: NextFunction) {

        // if (config.unauthorized_routes_allowed.includes(req.path))
        //     return next();

        if (!req.session?.user?.account_id)
            return res.status(401).send({ code: 401, type: 'unauthorized', message: 'Please sign in' });

        if (req.session.user.account_type !== 'secretariat')
            return res.status(401).send({ code: 401, type: 'unauthorized', message: 'Please sign in' });

        next();

    }




    // error handler
    async systemErrorHandler(error_obj: any, res: Response): Promise<Response> {

        try {

            const result = await accountsDb.query(`
                INSERT INTO
                    system_errors
                SET
                    error_code = :error_code,
                    error_metadata = :error_metadata;
            `, {
                error_code: error_obj?.code ? Number(error_obj.code) : 500,
                error_metadata: JSON.stringify(error_obj),
            });

        } catch (error) {

            if (process.env.ENVIRONMENT_MODE === 'development') console.log(error);

            return res.status(500).send({
                code: 500,
                type: 'cannot_connect_to_the_db',
                message: 'Cannot connect to the DB'
            });

        }


        if (process.env.ENVIRONMENT_MODE === 'development') console.log(error_obj);

        return res.status(error_obj?.code ? Number(error_obj.code) : 500).send(error_obj);

    }

}



export const utilsService = new UtilsService();
