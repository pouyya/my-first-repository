import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class AddonsService {

    private statusAddonsConfirmedSource = new Subject<boolean>();

    statusAddonsConfirmed$ = this.statusAddonsConfirmedSource.asObservable();

    announceAddonsStatus(status: boolean) {
        this.statusAddonsConfirmedSource.next(status);
    }

}