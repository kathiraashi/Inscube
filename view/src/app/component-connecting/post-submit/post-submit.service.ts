import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class PostSubmitService {

  private newPostSource = new BehaviorSubject<any>('');
  New_Post_Added = this.newPostSource.asObservable();

  private newTrendsSource = new BehaviorSubject<any>('');
  New_Trends_Added = this.newTrendsSource.asObservable();

  private ReloadFeeds = new BehaviorSubject<any>('');
  Reload_Feeds = this.ReloadFeeds.asObservable();

  constructor() { }

  Post_Submited(data: any) {
     this.newPostSource.next(data);
  }

  Trends_Submited(data: any) {
    this.newTrendsSource.next(data);
 }

  Refersh_Feeds(data: any) {
    this.ReloadFeeds.next(data);
 }

}
