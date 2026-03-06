export class Place {

    place_id?: string;
    country: string;
    city: string;
    postal_code: string;
    state: string;
    street?: string;
    longitude?: number;
    latitude?: number;


    constructor(props?: Place) {

        this.place_id = props?.place_id || null;
        this.country = props?.country || null;
        this.city = props?.city || null;
        this.postal_code = props?.postal_code || null;
        this.state = props?.state || null;
        this.street = props?.street || null;
        this.longitude = props?.longitude || null;
        this.latitude = props?.latitude || null;

    }

}
