import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-create-cube',
  templateUrl: './create-cube.component.html',
  styleUrls: ['./create-cube.component.css']
})
export class CreateCubeComponent implements OnInit {


  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';

  title: string;
  Locatin_Input: Boolean = false;
  Website_Input: Boolean = false;
  Email_Input: Boolean = false;
  Contact_Input: Boolean = false;

  onClose: Subject<boolean>;

  SecurityType: String = 'Close';
  SecurityCode: Boolean = false;

  constructor(public _bsModalRef: BsModalRef) {

  }

  ngOnInit(): void {
      this.onClose = new Subject();
      console.log(this.title);
  }

    View_Location_Input( ) {
        if (this.Locatin_Input) {
            this.Locatin_Input = false;
        } else {
            this.Locatin_Input = true;
        }
    }
    View_Website_Input( ) {
        if (this.Website_Input) {
            this.Website_Input = false;
        } else {
            this.Website_Input = true;
        }
    }
    View_Email_Input( ) {
        if (this.Email_Input) {
            this.Email_Input = false;
        } else {
            this.Email_Input = true;
        }
    }
    View_Contact_Input() {
        if (this.Contact_Input) {
            this.Contact_Input = false;
        } else {
            this.Contact_Input = true;
        }
    }

    onConfirm(): void {
        this.onClose.next(true);
        this._bsModalRef.hide();
    }

  onCancel(): void {
      this.onClose.next(false);
      this._bsModalRef.hide();
  }

  radioChange(event) {
      if ( event.value === 'Open') {
        this.SecurityCode = true;
      } else {
        this.SecurityCode = false;
      }
}

}
