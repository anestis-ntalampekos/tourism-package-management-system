import { utilsService } from './utils.service';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';


class RegistrationService {


    checkPassword(password: string): boolean {

        const isUpperCase = new RegExp(/(?=.*[A-Z])/g);
        const isSpecialChar = new RegExp(/(?=.*[!@#$%^&*])/g);
        const isLowerCase = new RegExp(/(?=.*[a-z])/g);
        const isNumeric = new RegExp(/(?=.*[0-9])/g);


        if (password.match(isUpperCase) && password.match(isSpecialChar) && password.match(isLowerCase) && password.match(isNumeric))
            return true;

        return false;

    }

}



class GenerateData {


    getWebToken(data: {
        account_id: string;
        username: string;
        email: string;
        account_type: string;
        type: 'activation_key' | 'request_password_change'
    }): string {


        return jwt.sign(
            {
                account_id: data.account_id,
                username: data.username,
                email: data.email,
                account_type: data.account_type,
                type: data.type
            },
            config.SECRET_KEY_JWT
        );


    }


}





export const registrationService = new RegistrationService();
export const generateAccountData = new GenerateData();
