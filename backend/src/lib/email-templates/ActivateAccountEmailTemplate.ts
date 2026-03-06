import { config } from '../../config';


export class ActivateAccountEmailTemplate {

    public html: string;


    constructor(jwt: string) {

        this.html = `
            <!doctype html>
            <html lang="en">

                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Account activation</title>
                </head>



                <body>

                    <p>
                        Welcome to the system! We are very pleased that you have decided to use our service to organize your trip.
                    </p>


                    <p>
                        Click the link bellow to activate your account:
                    </p>
                    <p>
                        <a href="${config.activation_link}${jwt}">Click here!</a>
                    </p>

                </body>

            </html>
        `;

    }

}
