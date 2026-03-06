export class Accommodation {

    accommodation_id?: string;
    place_id?: string;
    title: string;
    title_internal: string;
    type: 'properties' | 'hotel';

    location_details: {
        street?: string;
        city?: string;
        postal_code?: string;
        state?: string;
        country?: string;
        longitude?: number;
        latitude?: number;
    };

    accept_adults: boolean;
    accept_children: boolean;
    accept_infants: boolean;

    constructor(props?: Accommodation) {

        this.accommodation_id = props?.accommodation_id || null;
        this.place_id = props?.place_id || null;
        this.title = props?.title || null;
        this.title_internal = props?.title_internal || null;
        this.type = props?.type || null;

        this.location_details = props?.location_details || null;

        this.accept_adults = props?.accept_adults ? true : false;
        this.accept_children = props?.accept_children ? true : false;
        this.accept_infants = props?.accept_infants ? true : false;

    }

}
