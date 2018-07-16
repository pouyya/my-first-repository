import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class SharedService {

  private static subjects = {};

  publish(name: string, data: any) {
    var subject = SharedService.subjects[name];

    if (subject) {
      subject.next(data);
    }
  }

  getSubscribe(name: string) {
    var subject: Subject<any> = SharedService.subjects[name];

    if (!subject) {
      subject = SharedService.subjects[name] = new Subject<any>();
    }

    return subject;
  }

  unsubscribe(name: string) {
    var subject: Subject<any> = SharedService.subjects[name];

    if(subject){
      subject.unsubscribe();
      delete SharedService.subjects[name];
    }
  }
}