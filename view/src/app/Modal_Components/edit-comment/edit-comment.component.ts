import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BsModalRef } from 'ngx-bootstrap/modal';
import { MatSnackBar } from '@angular/material';

import { PostService } from './../../service/post/post.service';

@Component({
  selector: 'app-edit-comment',
  templateUrl: './edit-comment.component.html',
  styleUrls: ['./edit-comment.component.css']
})
export class EditCommentComponent implements OnInit {

  UsersBaseUrl = 'http://www.inscube.com/API/Uploads/Users/';
  CubeBaseUrl = 'http://www.inscube.com/API/Uploads/Cubes/';

  onClose: Subject<Object>;

  data;

  LoginUser;
  constructor(
              public _bsModalRef: BsModalRef,
              public snackBar: MatSnackBar,
              public Post_Service: PostService
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
      this.Post_Service.Comment_Update(Data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
          // this.snackBar.open( 'Comment Successfully Updated' , ' ', {
          //   horizontalPosition: 'center',
          //   duration: 3000,
          //   verticalPosition: 'top',
          //   });
            this.onClose.next({Status: true, Response: datas['Response'] });
            this._bsModalRef.hide();
        } else {
          // this.snackBar.open( 'Comment Update Failed Please Try Again !!', ' ', {
          // horizontalPosition: 'center',
          // duration: 3000,
          // verticalPosition: 'top',
          // });
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
