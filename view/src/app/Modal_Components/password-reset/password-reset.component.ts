import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BsModalRef } from 'ngx-bootstrap/modal';

import { MatSnackBar } from '@angular/material';

import { SigninSignupService } from './../../service/signin-signup/signin-signup.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {

  onClose: Subject<Object>;

  data;

  alert: Boolean = false;
  alertMessage;

  Success: Boolean = false;
  SuccessMessage;

  Email;
  password;


  constructor(public _bsModalRef: BsModalRef,
    private Service: SigninSignupService,
    public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.onClose = new Subject();
    this.Email = this.data.User_Info.Email;
  }

  submit() {
    this.alert = false;
    this.Success = false;
    if (this.Email === '' || this.Email === undefined) {
      this.alert = true;
      this.alertMessage = 'Enter your email!';
    } else {
      this.Service.password_reset_submit(this.password, this.data.User_Info._id).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True' ) {
            this.snackBar.open( 'Password reset successfull', ' ', {
              horizontalPosition: 'center',
              duration: 5000,
              verticalPosition: 'top',
            });
            this._bsModalRef.hide();
          } else if (datas['Status'] === 'True' && datas['Output'] === 'False' ) {
            this.Success = false;
            this.alert = true;
            this.alertMessage = datas['Message'];
          } else {
            this.Success = false;
            this.alert = true;
            this.alertMessage = 'Password reset failed failed please try again!';
          }
      });
    }
  }

}
