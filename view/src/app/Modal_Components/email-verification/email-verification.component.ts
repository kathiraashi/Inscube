import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BsModalRef } from 'ngx-bootstrap/modal';

import { MatSnackBar } from '@angular/material';

import { SigninSignupService } from './../../service/signin-signup/signin-signup.service';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent implements OnInit {

  onClose: Subject<Object>;

  data;

  alert: Boolean = false;
  alertMessage;

  Success: Boolean = false;
  SuccessMessage;

  Email;


  constructor(public _bsModalRef: BsModalRef,
    private Service: SigninSignupService,
    public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.onClose = new Subject();
  }

  submit() {
    this.alert = false;
    this.Success = false;
    if (this.Email === '' || this.Email === undefined) {
      this.alert = true;
      this.alertMessage = 'Enter your email!';
    } else {
      this.Service.Send_Email_Password_Reset_Request(this.Email).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True' ) {
            this.alert = false;
            this.Success = true;
            this.SuccessMessage = 'Password reset link send to the Email address.';
          } else if (datas['Status'] === 'True' && datas['Output'] === 'False' ) {
            this.Success = false;
            this.alert = true;
            this.alertMessage = datas['Message'];
          } else {
            this.Success = false;
            this.alert = true;
            this.alertMessage = 'Password reset request failed please try again!';
          }
      });
    }
  }

}
