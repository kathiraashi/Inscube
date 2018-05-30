import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-alert-privacy-update',
  templateUrl: './alert-privacy-update.component.html',
  styleUrls: ['./alert-privacy-update.component.css']
})
export class AlertPrivacyUpdateComponent implements OnInit {

  data;

  onClose: Subject<Object>;

  constructor(public _bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.onClose = new Subject();
  }

  Yes() {
    this.onClose.next({Status: 'Yes' });
    this._bsModalRef.hide();
  }

  No() {
    this.onClose.next({Status: 'No' });
    this._bsModalRef.hide();
  }

}
