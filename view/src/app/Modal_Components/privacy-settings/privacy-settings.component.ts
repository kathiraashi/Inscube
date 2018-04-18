import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { MatSnackBar } from '@angular/material';

import { SigninSignupService } from './../../service/signin-signup/signin-signup.service';

@Component({
  selector: 'app-privacy-settings',
  templateUrl: './privacy-settings.component.html',
  styleUrls: ['./privacy-settings.component.css']
})
export class PrivacySettingsComponent implements OnInit {

  onClose: Subject<Object>;

  data;
  LoginUser;
  SelectedObtion;

  constructor(public _bsModalRef: BsModalRef,
              private Service: SigninSignupService,
              public snackBar: MatSnackBar
            ) {
              this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
            }


  ngOnInit() {
    this.onClose = new Subject();
    this.SelectedObtion = this.data.User_Info.Show_Profile_To;
  }

  Change_Option(value) {
    this.SelectedObtion = value;
  }

  Submit() {
    const data = { User_Id: this.LoginUser._id , Show_Profile_To: this.SelectedObtion };
    this.Service.Privacy_Update(data).subscribe( datas => {
        if (datas['Status'] === 'True') {
          this.snackBar.open( 'Privacy Settings successfully updated' , ' ', {
            horizontalPosition: 'center',
            duration: 3000,
            verticalPosition: 'top',
          });
          this.onClose.next({Status: true, Response: datas['Response'] });
          this._bsModalRef.hide();
        }
    });
  }
}
