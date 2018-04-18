import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class CubeViewRelatedService {

  private ViewSource = new BehaviorSubject<any>('');
  currentMessage = this.ViewSource.asObservable();

  private TopicAdd = new BehaviorSubject<any>('');
  New_Topic = this.TopicAdd.asObservable();

  constructor() { }

  Cube_View_Source(data: any) {
     this.ViewSource.next(data);
  }

  New_Topic_Add(data: any) {
    this.TopicAdd.next(data);
 }

}
