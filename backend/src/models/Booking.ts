import { Customer } from './Customer';
import { Secretariat } from './Secretariat';
import { TravelAgent } from './TravelAgent';


export class PlanBooking {

    booking_id?: string;
    plan_id: string;
    customer_id?: string;
    secretary_id?: string;
    travel_agent_id?: string;

    main_customer?: Customer;
    secretary?: Secretariat;
    travel_agent?: TravelAgent;

    booking_dates_start: string | Date;
    booking_dates_end?: string | Date;

    paid?: boolean;

    card_number?: string;


    constructor(props?: PlanBooking) {

        this.booking_id = props?.booking_id || null;
        this.plan_id = props?.plan_id || null;
        this.customer_id = props?.customer_id || null;
        this.secretary_id = props?.secretary_id || null;
        this.travel_agent_id = props?.travel_agent_id || null;
        this.main_customer = props?.main_customer || new Customer();
        this.secretary = props?.secretary || new Secretariat();
        this.travel_agent = props?.travel_agent || new TravelAgent();
        this.booking_dates_start = props?.booking_dates_start || null;
        this.booking_dates_end = props?.booking_dates_end || null;
        this.paid = props?.paid ? true : false;
        this.card_number = props?.card_number || null;

    }

}
