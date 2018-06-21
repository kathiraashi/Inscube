import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CaptureService } from './../../service/capture/capture.service';

@Component({
  selector: 'app-report-capture-comment',
  templateUrl: './report-capture-comment.component.html',
  styleUrls: ['./report-capture-comment.component.css']
})
export class ReportCaptureCommentComponent implements OnInit {


  ActiveText = 'Harassment';
  ErrorShow: Boolean = false;

  LoginUser;

  data;
  onClose: Subject<Object>;

  constructor(public _bsModalRef: BsModalRef,
              public snackBar: MatSnackBar,
              public _Service: CaptureService,
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
      this._Service.Report_CaptureComment(this.data.Values)
        .subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
                this.onClose.next({Status: 'True'});
                this._bsModalRef.hide();
          } else {
            this._bsModalRef.hide();
          }
      });
    }
  }


}
