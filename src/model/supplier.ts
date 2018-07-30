import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';
import {DisplayColumn, FilterType, SearchFilter} from "../metadata/listingModule";

export class Supplier extends DBBasedEntity {
    @DisplayColumn(1) @SearchFilter(FilterType.Text, 1, 'Search by Supplier Name')
    public name: string;
    public description: string;

    /** Personal Info */
    public firstName: string;
    public lastName: string;
    @DisplayColumn(3)
    public email: string;
    @DisplayColumn(2)
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