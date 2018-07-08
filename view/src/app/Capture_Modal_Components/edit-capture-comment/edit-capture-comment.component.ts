import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BsModalRef } from 'ngx-bootstrap/modal';
import { MatSnackBar } from '@angular/material';

import { CaptureService } from './../../service/capture/capture.service';

@Component({
  selector: 'app-edit-capture-comment',
  templateUrl: './edit-capture-comment.component.html',
  styleUrls: ['./edit-capture-comment.component.css']
})
export class EditCaptureCommentComponent implements OnInit {


  UsersBaseUrl = 'http://localhost:4000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:4000/API/Uploads/Cubes/';

  onClose: Subject<Object>;

  data;

  LoginUser;
  constructor(
              public _bsModalRef: BsModalRef,
              public snackBar: MatSnackBar,
              public _Service: CaptureService
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
      this._Service.Capture_Comment_Update(Data).subscribe( datas => {
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
