import { Accommodation } from './Accommodation';
import { Place } from './Place';

export class TravelPlan {

    plan_id?: string;
    title: string;
    title_internal: string;
    price: number;
    booking_type?: 'direct' | 'request';
    category: string;
    persons?: number;
    adults?: number;
    children?: number;
    infants?: number;
    small_description: string;
    description: string;

    date_range: string[] | Date[];
    start_date?: string | Date;
    end_date?: string | Date;
    min_days?: number;
    max_days?: number;

    cancelation_policy?: string;
    available: boolean;
    available_from_date?: string | Date;
    available_until_date?: string | Date;
    starting_type: 'fixed_times' | 'anytime_during_timerange';
    adults_only?: boolean;
    family_friendly?: boolean;

    area_description?: string;
    other_important_info?: string;

    means_of_transport_arrival: {
        type: 'airline' | 'ship' | 'train' | 'bus';
        company_name: string;
        start_time: string;
        arrival_time: string;
        number: string;
    };
    means_of_transport_return: {
        type: 'airline' | 'ship' | 'train' | 'bus';
        company_name: string;
        start_time: string;
        arrival_time: string;
        number: string;
    };

    place_id: string;
    accommodation_id: string;


    discount?: {
        code_type?: 'discount' | 'promotional' | 'rate' | 'convention_number' | 'voucher';
        code_value?: string;
        enabled?: boolean;
        type?: 'percent' | 'fixed';
        value?: number;
    };



    // not in db
    place_details?: Place;
    accommodation_details?: Accommodation;

    constructor(props?: TravelPlan) {

        this.plan_id = props?.plan_id || null;
        this.title = props?.title || null;
        this.title_internal = props?.title_internal || null;
        this.price = props?.price || null;
        this.booking_type = props?.booking_type || null;
        this.category = props?.category || null;
        this.persons = props?.persons || 1;
        this.adults = props?.adults || 1;
        this.children = props?.children || 0;
        this.infants = props?.infants || 0;
        this.small_description = props?.small_description || null;
        this.description = props?.description || null;

        this.date_range = props?.date_range || [];
        this.start_date = props?.start_date || null;
        this.end_date = props?.end_date || null;
        this.min_days = props?.min_days || null;
        this.max_days = props?.max_days || null;

        this.cancelation_policy = props?.cancelation_policy || null;
        this.available = props?.available ? true : false;
        this.available_from_date = props?.available_from_date || null;
        this.available_until_date = props?.available_until_date || null;
        this.starting_type = props?.starting_type || null;
        this.adults_only = props?.adults_only ? true : false;
        this.family_friendly = props?.family_friendly ? true : false;

        this.area_description = props?.area_description || null;
        this.other_important_info = props?.other_important_info || null;

        this.means_of_transport_arrival = props?.means_of_transport_arrival || null;
        this.means_of_transport_return = props?.means_of_transport_return || null;

        this.place_id = props?.place_id || null;
        this.accommodation_id = props?.accommodation_id || null;

        this.discount = props?.discount || null;

        this.place_details = props?.place_details || null;
        this.accommodation_details = props?.accommodation_details || null;

    }

}
