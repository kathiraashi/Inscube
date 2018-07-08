import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl} from '@angular/forms';
import { Subject } from 'rxjs/Subject';

import { MatSnackBar } from '@angular/material';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';

import { CubeService } from './../../service/cube/cube.service';

import { CubeViewRelatedService } from './../../component-connecting/cube-view-related/cube-view-related.service';



@Component({
  selector: 'app-add-email-invite',
  templateUrl: './add-email-invite.component.html',
  styleUrls: ['./add-email-invite.component.css']
})
export class AddEmailInviteComponent implements OnInit {


  modalRef: BsModalRef;

  UsersBaseUrl = 'http://localhost:4000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:4000/API/Uploads/Cubes/';

  data;

  onClose: Subject<Object>;

  Post_Submit: Boolean = false;

  LoginUser;
  Form: FormGroup;
  FormData: FormData = new FormData;

  orderForm: FormGroup;
  items;

  constructor(private modalService: BsModalService,
              public _bsModalRef: BsModalRef,
              private formBuilder: FormBuilder,
              public snackBar: MatSnackBar,
              public Cube_Service: CubeService,
              public Cube_View_Service: CubeViewRelatedService
            ) {
              this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
            }

  ngOnInit() {
    this.onClose = new Subject();

    this.orderForm = this.formBuilder.group({
      items: this.formBuilder.array([ this.createItem() ])
    });

  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      email: new FormControl('', [ Validators.required, Validators.pattern('[^ @]*@[^ @]*') ])
    });
  }

  addItem(): void {
    this.items = this.orderForm.get('items') as FormArray;
    this.items.push(this.createItem());
  }

  deleteRow(index: number) {
    const control = this.orderForm.get('items') as FormArray;
    if (control.length > 1 ) {
      control.removeAt(index);
    }
  }

  getControls(frmGrp: FormGroup, key: string) {
    return (<FormArray>frmGrp.controls[key]).controls;
  }

  onSubmit() {
    if (this.orderForm.valid) {
      this.Post_Submit = true;
      const emails_list = JSON.stringify(this.orderForm.controls['items'].value);
      const data = { User_Id: this.LoginUser._id, Email_Ids: emails_list, Cube_Id : this.data.Cube_Info._id };
        this.Cube_Service.Email_Invite_Cube(data).subscribe( datas => {
            if (datas['Status'] === 'True' && datas['Output'] === 'True') {
                    this.snackBar.open( 'Successfully sent' , ' ', {
                      horizontalPosition: 'center',
                      duration: 3000,
                      verticalPosition: 'top',
                    });
                    this._bsModalRef.hide();

            } else {
                this.Post_Submit = false;
                this.snackBar.open( datas['Message'], ' ', {
                  horizontalPosition: 'center',
                  duration: 3000,
                  verticalPosition: 'top',
                });
                this._bsModalRef.hide();
            }
        });
    } else {
      this.snackBar.open( 'Invalid email or empty email!', ' ', {
        horizontalPosition: 'center',
        duration: 5000,
        verticalPosition: 'top',
      });
    }
}


}
