import { Component, OnInit } from '@angular/core';

import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';
import { SigninSignupService } from './../../service/signin-signup/signin-signup.service';

@Component({
  selector: 'app-feeds-main',
  templateUrl: './feeds-main.component.html',
  styleUrls: ['./feeds-main.component.css']
})
export class FeedsMainComponent implements OnInit {

  Active_Tab = 'Highlights';
  ShowingImg = '1';
  LoginUser;
  Explainer_Completed: Boolean = false;

   constructor(
      private Service: SigninSignupService,
      public _PostSubmitted: PostSubmitService,
   ) {
      this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));

      if (this.LoginUser.Explainer_Completed) {
         this.Explainer_Completed = true;
      }

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

   GoNext(num) {
      this.ShowingImg = num;
   }

   Complete() {
      this.Service.Explainer_Completed_Update(this.LoginUser._id).subscribe( _Info => {
         this.LoginUser.Explainer_Completed = true;
         localStorage.setItem('CurrentUser', JSON.stringify(this.LoginUser));
         this.Explainer_Completed = true;
      });
   }

}
