import { Component, OnInit } from '@angular/core';

import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';

@Component({
  selector: 'app-feeds-main',
  templateUrl: './feeds-main.component.html',
  styleUrls: ['./feeds-main.component.css']
})
export class FeedsMainComponent implements OnInit {

  Active_Tab = 'Highlights';

  constructor(
    public _PostSubmitted: PostSubmitService,
  ) {
    this._PostSubmitted.New_Trends_Added.subscribe(message => {
      this.Active_Tab = 'Trends';
     });
     this._PostSubmitted.New_Post_Added.subscribe(message => {
      this.Active_Tab = 'Highlights';
     });
   }

  ngOnInit() {
  }

  ChangeActiveTab(name) {
    if (name !== this.Active_Tab) {
      this.Active_Tab = name;
    }
  }

}
