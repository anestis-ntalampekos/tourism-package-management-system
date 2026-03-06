import * as express from 'express';
import * as session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import * as cors from 'cors';
import * as morgan from 'morgan';
import * as https from 'https';
import * as expressMySqlSession from 'express-mysql-session';
import * as passport from 'passport';
require('dotenv').config();

import { utilsService } from './lib/utils.service';
import { stringValidator } from './lib/stringValidator.service';
import { accountsDb } from './lib/connectors/db/accounts-db';
import { initializePassportLocalStrategy } from './lib/authenticators/passport-local.mw';

import { Account, Customer, Secretariat, TravelAgent } from './models';


import { IndexRoutes } from './routes/index';
import { AuthRoutes } from './routes/auth';
import { TravelAgentManagementRoutes } from './routes/travel-agent';
import { CustomerManagementRoutes } from './routes/customers';
import { SecretaryManagementRoutes } from './routes/secretaries';
import { PlansRoutes } from './routes/plans';
import { PlacesRoutes } from './routes/places';
import { AccommodationRoutes } from './routes/accommodation';
import { BookingsRoutes } from './routes/bookings';




declare module 'express-session' {
    export interface SessionData {
        user: Account;
        secretary?: Secretariat;
        travel_agent?: TravelAgent;
        customer?: Customer;
        created_at: string | Date;
    }
}


class App {

    private app: express.Application;

    constructor() {

        this.app = express(); // create express application instance
        this.app.set('port', process.env.BACKEND_PORT); // define the port globally

        this.config();
        this.routes();

    }



    private domains_list = [
        'http://localhost:4200',
        'http://127.0.0.1:5500',
    ];



    // Server configuration
    private config(): void {


        this.app.use(express.json({ limit: '32mb' })); // support application/json type post data
        this.app.use(express.urlencoded({ extended: false, limit: '32mb' })); // support application/x-www-form-urlencoded post data

        // this.server.use(express.static(utils.path.join(__dirname, 'public')));               // for production mode


        // Handle user sessions
        const mySQLSessionStore = expressMySqlSession(session);
        const sessionStore = new mySQLSessionStore({
            checkExpirationInterval: 900000, // clear expired sessions every 15 minutes
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'sid',
                    expires: 'expires',
                    data: 'data'
                }
            }
        }, accountsDb._mysql.createPool(accountsDb.poolConfig));


        this.app.use(session({ // https://www.npmjs.com/package/express-session
            secret: process.env.SESSION_PUBLIC_KEY,
            name: 'tourist-office-management-system.sid',
            cookie: {
                httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not client JavaScript, helping to protect against cross-site scripting attacks.
                secure: true, // Ensures the browser only sends the cookie over HTTPS.
                maxAge: 3 * 24 * 60 * 60 * 1000,
                sameSite: 'none',
            },
            saveUninitialized: false,
            resave: true,
            store: sessionStore, // session store
            genid: (req: express.Request) => uuidv4()
        }));



        this.app.use(cors({
            origin: '*',
            // origin: (origin, callback) => {

            //     if (!origin)
            //         return callback(null, true);

            //     if (!this.domains_list.includes(origin))
            //         return callback(null, false);                // to block --> (null, false)

            //     return callback(null, true);
            // },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        }));

        // this.app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {

        //     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Authorization, Content-Type, X-Content-Type-Options');

        //     next();

        // });


        this.app.set('trust proxy', true);


        // // routes tracker
        const accessLogStream = utilsService.fs.createWriteStream(
            utilsService.path.join(__dirname, 'access.log'),
            { flags: 'a' }
        );
        this.app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: accessLogStream }));





        // configure passport
        this.app.use(passport.initialize());
        this.app.use(passport.authenticate('session'));
        initializePassportLocalStrategy.initPassport(this.app);




        // Start express server
        if (process.env.ENVIRONMENT_MODE === 'development') {

            const https_server = https.createServer({
                key: utilsService.fs.readFileSync(utilsService.path.join(__dirname, '/config/certs/server.key')),
                cert: utilsService.fs.readFileSync(utilsService.path.join(__dirname, '/config/certs/server.cert'))
            }, this.app);

            https_server.listen(this.app.get('port'), () => {
                console.log(`Tourist Office Management System - Copyright 20[2-9][0-9]`);
                console.log(`Server is running on port: ${this.app.get('port')} (https://localhost:${this.app.get('port')})`);
            });

        } else
            this.app.listen(this.app.get('port'), () => {
                console.log(`Tourist Office Management System - Copyright 20[2-9][0-9]`);
            });

    }



    // Server routing
    private routes(): void {

        new IndexRoutes().routes(this.app);
        new AuthRoutes().routes(this.app);
        new TravelAgentManagementRoutes().routes(this.app);
        new CustomerManagementRoutes().routes(this.app);
        new SecretaryManagementRoutes().routes(this.app);
        new PlansRoutes().routes(this.app);
        new PlacesRoutes().routes(this.app);
        new AccommodationRoutes().routes(this.app);
        new BookingsRoutes().routes(this.app);

    }

}


const app = new App();
