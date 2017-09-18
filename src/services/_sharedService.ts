import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SharedService {
  private payload = new Subject<any>();

  payload$ = this.payload.asObservable();

  publish(data: any) {
    this.payload.next(data);
  }  
}