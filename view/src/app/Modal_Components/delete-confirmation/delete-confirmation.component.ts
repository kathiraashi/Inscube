import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.css']
})
export class DeleteConfirmationComponent implements OnInit {

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
