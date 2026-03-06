import { Request, Response, NextFunction, query } from 'express';
// import { config } from '../config';
import { utilsService } from './utils.service';
require('dotenv').config();




class StringValidator {


    isEmail(text: string): boolean {

        const emailRegExp = new RegExp(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,50}$/gm);

        return emailRegExp.test(text);

    }




    /** find differences between 2 strings
     * NOTE: Length if both strings must be equal or the new string must be longer (str2)
     * @params str1
     * @params str2
     */
    findDifferencesString(str1: string, str2: string): string {
        let diff = '';
        let str1_counter = 0;
        str2.split('').forEach((val) => {
            if (val !== str1.charAt(str1_counter))
                diff += val;
            else
                str1_counter++;
        });

        return diff;
    }


}



export const stringValidator = new StringValidator();
