import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BsModalRef } from 'ngx-bootstrap/modal';


import { MatSnackBar } from '@angular/material';

import { CubeService } from './../../service/cube/cube.service';

@Component({
  selector: 'app-join-confirmation',
  templateUrl: './join-confirmation.component.html',
  styleUrls: ['./join-confirmation.component.css']
})
export class JoinConfirmationComponent implements OnInit {

  onClose: Subject<Object>;

  LoginUser;
  Secret_Code: String;
  Show_Join: Boolean = false;

  data: Object;
  Show_Alert: Boolean = false ;
  Alert_Message;

  constructor( public _bsModalRef: BsModalRef,
            public snackBar: MatSnackBar,
            public Cube_Service: CubeService,
          ) {
            this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
   }



  ngOnInit(): void {
    this.onClose = new Subject();
  }

  valuechange(value) {
    if ( value  !== '') {
      this.Show_Join = true;
      this.Secret_Code = value;
    } else {
      this.Show_Join = false;
    }
  }

  Submit() {
    if ( this.Secret_Code === this.data['Cube_Info'].Security_Code ) {
       this.Show_Alert = false;
        this.Show_Join = false;
        const data = { User_Id: this.LoginUser._id, Cube_Id: this.data['Cube_Info']._id };
        this.Cube_Service.Follow_Cube(data).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
                this.onClose.next({Status: 'Success' });
                this._bsModalRef.hide();
          } else {
            this.Show_Alert = true;
            this.Alert_Message = datas['Message'];
          }
      });
    } else {
      this.Alert_Message = 'Please Enter Correct Secret Code !';
      this.Show_Alert = true;
      this.Show_Join = true;
    }

  }
}
