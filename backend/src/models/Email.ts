export interface SimpleEmailAttributes {

    host?: string;
    port?: number;
    secure?: boolean;
    from_name?: string;
    from_email?: string;
    from_psswd?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    text?: string;
    html: string;

}
