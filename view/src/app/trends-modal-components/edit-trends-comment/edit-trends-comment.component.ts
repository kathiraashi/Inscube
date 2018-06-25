import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BsModalRef } from 'ngx-bootstrap/modal';
import { MatSnackBar } from '@angular/material';

import { TrendsService } from './../../service/trends/trends.service';

@Component({
  selector: 'app-edit-trends-comment',
  templateUrl: './edit-trends-comment.component.html',
  styleUrls: ['./edit-trends-comment.component.css']
})
export class EditTrendsCommentComponent implements OnInit {


  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';

  onClose: Subject<Object>;

  data;

  LoginUser;
  constructor(
              public _bsModalRef: BsModalRef,
              public snackBar: MatSnackBar,
              public _Service: TrendsService
            ) {
              this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
  }

  ngOnInit() {
    this.onClose = new Subject();
  }

  submit_comment(value) {
    if (value !== '' ) {
      const Data = {
        Comment_Id : this.data.Value._id,
        Comment_Text : value
      };
      this._Service.Trends_Comment_Update(Data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            this.onClose.next({Status: true, Response: datas['Response'] });
            this._bsModalRef.hide();
        } else {
          this.onClose.next({Status: false });
          this._bsModalRef.hide();
        }
      });
    } else {
      this.snackBar.open( 'Write some words!', ' ', {
        horizontalPosition: 'center',
        duration: 3000,
        verticalPosition: 'top',
        });
    }
  }


}
