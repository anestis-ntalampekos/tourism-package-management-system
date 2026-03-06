export class Account {

    account_id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password?: string;
    account_type: 'system_admin'
        | 'secretariat'
        | 'travel_agent'
        | 'customer';
    activated?: boolean;
    request_password_change?: boolean;
    created_at?: string | Date;

    constructor(props?: Account) {

        this.account_id = props?.account_id || null;
        this.username = props?.username || null;
        this.first_name = props?.first_name || null;
        this.last_name = props?.last_name || null;
        this.email = props?.email || null;
        this.phone = props?.phone || null;
        this.password = props?.password || null;
        this.account_type = props?.account_type || null;
        this.activated = props?.activated ? true : false;
        this.request_password_change = props?.request_password_change ? true : false;
        this.created_at = props?.created_at || null;

    }

}
