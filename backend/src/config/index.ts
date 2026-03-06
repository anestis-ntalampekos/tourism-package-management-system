require('dotenv').config();


class Config {

    public SECRET_KEY_JWT: string;

    public nanoid_basic_alphabet: string;
    public nanoid_basic_length: number;

    public account_id_length: number;
    public customer_id_length: number;
    public travel_agent_id_length: number;
    public secretariat_id_length: number;
    public plan_id_length: number;
    public place_id_length: number;
    public accommodation_id_length: number;
    public booking_id_length: number;




    // links
    public activation_link: string;
    public request_pwd_change: string;


    constructor() {

        this.SECRET_KEY_JWT = process.env.SECRET_KEY_JWT;

        // basic nanoid alphabet
        this.nanoid_basic_alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_';
        this.nanoid_basic_length = 16;

        this.account_id_length = 14;
        this.customer_id_length = 14;
        this.travel_agent_id_length = 14;
        this.secretariat_id_length = 14;
        this.plan_id_length = 6;
        this.place_id_length = 14;
        this.accommodation_id_length = 14;
        this.booking_id_length = 14;



        // activation link
        this.activation_link = process.env.ACTIVATION_LINK;
        this.request_pwd_change = process.env.CHANGE_PWD_LINK;

    }

}


export const config = new Config();
