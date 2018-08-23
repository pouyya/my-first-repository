import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class NetworkService {

    private statusConfirmedSource = new Subject<boolean>();

    statusConfirmed$ = this.statusConfirmedSource.asObservable();

    announceStatus(status: boolean) {
        this.statusConfirmedSource.next(status);
    }

}