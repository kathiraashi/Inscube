import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { MatSnackBar } from '@angular/material';

import { SigninSignupService } from './../../service/signin-signup/signin-signup.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  onClose: Subject<Object>;

  data;
  LoginUser;
  alert: Boolean = false;
  alertMessage;

  Old_Password;
  New_Password;

  constructor(public _bsModalRef: BsModalRef,
              private Service: SigninSignupService,
              public snackBar: MatSnackBar
            ) {
              this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
            }


  ngOnInit() {
    this.onClose = new Subject();
  }

  submit() {
    if (this.Old_Password === '' || this.Old_Password === undefined) {
      this.alert = true;
      this.alertMessage = 'Old password is required!';
    } else if (this.New_Password === '' || this.New_Password === undefined ) {
      this.alert = true;
      this.alertMessage = 'New password is required!';
    } else {
      const data = { User_Id: this.LoginUser._id , Old_Password: this.Old_Password, New_Password: this.New_Password };
      this.Service.Password_Change(data).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True' ) {
            this.alert = false;
            this.snackBar.open( 'New Password successfully updated' , ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
            this.onClose.next({Status: true, Response: datas['Response'] });
            this._bsModalRef.hide();
          } else if (datas['Status'] === 'True' && datas['Output'] === 'False' ) {
            this.alert = true;
            this.alertMessage = datas['Message'];
          } else {
            this.snackBar.open( 'Password updated failed please try again!' , ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          }
      });
    }
  }

}
