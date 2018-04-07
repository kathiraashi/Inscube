import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-create-cube',
  templateUrl: './create-cube.component.html',
  styleUrls: ['./create-cube.component.css']
})
export class CreateCubeComponent implements OnInit {

  title: string;

  onClose: Subject<boolean>;

  constructor(public _bsModalRef: BsModalRef) {

  }

  ngOnInit(): void {
      this.onClose = new Subject();
      console.log(this.title);
  }

  onConfirm(): void {
      this.onClose.next(true);
      this._bsModalRef.hide();
  }

  onCancel(): void {
      this.onClose.next(false);
      this._bsModalRef.hide();
  }


}
