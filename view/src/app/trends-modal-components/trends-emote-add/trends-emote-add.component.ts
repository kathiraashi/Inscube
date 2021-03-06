import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BsModalRef } from 'ngx-bootstrap/modal';

import { MatSnackBar } from '@angular/material';

import { TrendsService } from './../../service/trends/trends.service';

@Component({
  selector: 'app-trends-emote-add',
  templateUrl: './trends-emote-add.component.html',
  styleUrls: ['./trends-emote-add.component.css']
})
export class TrendsEmoteAddComponent implements OnInit {


  onClose: Subject<Object>;
  LoginUser;

  Text: String;
  Show_Submit: Boolean = false;

  data: Object;
  Show_Alert: Boolean = false ;
  Alert_Message;

  constructor( public _bsModalRef: BsModalRef,
                public snackBar: MatSnackBar,
               private Service: TrendsService) {

                this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
  }

  ngOnInit() {
    this.onClose = new Subject();
  }

  valuechange(value) {
    if ( value  !== '') {
      if (value.length > 10) {
        this.Alert_Message = 'max character limit 10';
        this.Show_Alert = true;
        this.Show_Submit = false;
        this.Text = '';
      } else {
        this.Show_Alert = false;
        this.Show_Submit = true;
        this.Text = value;
      }
    } else {
      this.Show_Submit = false;
    }
  }

  Submit() {
    if ( this.Text !== '' ) {
       this.Show_Alert = false;
        this.Show_Submit = false;
        const data = { User_Id: this.LoginUser._id, Trends_Id: this.data['Post_Info']._id, Emote_Text: this.Text };
        this.Service.Trends_Emote_Submit(data).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            if (datas['Response'].Count > 1 ) {
              this.onClose.next({Status: 'Success_Update', Response: datas['Response'] });
              this._bsModalRef.hide();
            } else {
              this.onClose.next({Status: 'Success_New', Response: datas['Response'] });
              this._bsModalRef.hide();
            }
          } else {
            this.Show_Alert = true;
            this.Alert_Message = datas['Message'];
          }
      });
    } else {
      this.Alert_Message = 'Please enter some text !';
      this.Show_Alert = true;
      this.Show_Submit = true;
    }

  }


}
