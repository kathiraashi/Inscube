import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { PostService } from './../../service/post/post.service';

@Component({
  selector: 'app-report-post',
  templateUrl: './report-post.component.html',
  styleUrls: ['./report-post.component.css']
})
export class ReportPostComponent implements OnInit {

  ActiveText = 'Harassment';
  ErrorShow: Boolean = false;

  LoginUser;

  data;
  onClose: Subject<Object>;

  constructor(public _bsModalRef: BsModalRef,
              public snackBar: MatSnackBar,
              public Post_Service: PostService,
          ) {
            this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
          }

  ngOnInit() {
    this.onClose = new Subject();
  }

  ActiveCategorySelect(text) {
    if (this.ActiveText !== text) {
      this.ActiveText = text;
    }
  }

  submit(value) {
    if (this.ActiveText === 'Other' && value === '') {
      this.ErrorShow = true;
      setTimeout( () => { this.ErrorShow = false; }, 4000);
    } else {
      this.data.Values.Report_Text = value;
      this.data.Values.Report_Type = this.ActiveText;
      this.Post_Service.Report_Post(this.data.Values)
        .subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
                this.onClose.next({Status: 'True'});
                this._bsModalRef.hide();
          } else if ( datas['Status'] === 'True' && datas['Output'] === 'False') {
            this.snackBar.open( datas['Message'], ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          } else {
            this.snackBar.open( 'Post Report Failed Please try Again!!', ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
            this._bsModalRef.hide();
          }
      });
    }
  }

}
