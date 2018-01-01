import { DBBasedEntity } from './dbBasedEntity';

export class Supplier extends DBBasedEntity {
    public name: string;
    public description: string;

    /** Personal Info */
    public firstName: string;
    public lastName: string;
    public email: string;
    public cellphone: string;
    public telephone: string;
    public website: string;

    /** Physical Address */
    public phyStreetAddr: string;
    public phySuburb: string;
    public phyCity: string;
    public phyState: string;
    public phyZipCode: string;
    public phyCountry: string;

    /** Postal Address */
    public posStreetAddr: string;
    public posSuburb: string;
    public posCity: string;
    public posState: string;
    public posZipCode: string;
    public posCountry: string;    
}