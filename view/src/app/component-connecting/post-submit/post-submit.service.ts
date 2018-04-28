import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class PostSubmitService {

  private messageSource = new BehaviorSubject<any>('');
  currentMessage = this.messageSource.asObservable();

  private ReloadFeeds = new BehaviorSubject<any>('');
  Reload_Feeds = this.ReloadFeeds.asObservable();

  constructor() { }

  Post_Submited(data: any) {
     this.messageSource.next(data);
  }

  Refersh_Feeds(data: any) {
    this.ReloadFeeds.next(data);
 }

}
