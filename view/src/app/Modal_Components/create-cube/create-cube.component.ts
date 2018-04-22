import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import { MatSnackBar } from '@angular/material';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CubeService } from './../../service/cube/cube.service';

@Component({
  selector: 'app-create-cube',
  templateUrl: './create-cube.component.html',
  styleUrls: ['./create-cube.component.css']
})
export class CreateCubeComponent implements OnInit {


  CategoryBaseUrl = 'http://206.189.92.174:80/API/Uploads/Category/';

  data: Object;
  Locatin_Input: Boolean = false;
  Website_Input: Boolean = false;
  Email_Input: Boolean = false;
  Contact_Input: Boolean = false;

  onClose: Subject<Object>;

  SecurityType: String = 'Open';
  SecurityCode: Boolean = false;


  @ViewChild('fileInput') fileInput: ElementRef;

  LoginUser;
  Default_Image;
  Form: FormGroup;
  FormData: FormData = new FormData;
  Show_Img_Preview: Boolean = false;
  Preview_Img: any ;

  constructor(  public _bsModalRef: BsModalRef,
                private router: Router,
                private formBuilder: FormBuilder,
                private Service: CubeService,
                public snackBar: MatSnackBar ) {
        this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
  }

  ngOnInit(): void {
        this.onClose = new Subject();
        this.Default_Image = this.data['Category_Info'].Image;
        this.Form = this.formBuilder.group({
            User_Id: new FormControl(this.LoginUser._id, Validators.required),
            Category_Id: new FormControl(this.data['Category_Info']._id, Validators.required),
            Name: new FormControl('', Validators.required),
            Security: new FormControl('', Validators.required),
            Security_Code: new FormControl(''),
            Description: new FormControl(''),
            Location: new FormControl(''),
            Web: new FormControl(''),
            Mail: new FormControl(''),
            Contact: new FormControl('')
        });
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
    radioChange(event) {
        if ( event.value === 'Close') {
            this.SecurityCode = true;
        } else {
            this.SecurityCode = false;
        }
    }

    onFileChange(event) {
        if (event.target.files && event.target.files.length > 0) {
          this.Show_Img_Preview = true ;
          const reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = (events) => {
              this.Preview_Img = events.target['result'];
            };
          const file = event.target.files[0];
          this.FormData.set('image', file, file.name);
        } else {
          this.Show_Img_Preview = false ;
        }
    }

    onSubmit() {

        if ( this.Form.valid ) {
            this.FormData.set('User_Id', this.Form.controls['User_Id'].value);
            this.FormData.set('Category_Id', this.Form.controls['Category_Id'].value);
            this.FormData.set('Name', this.Form.controls['Name'].value);
            this.FormData.set('Security', this.Form.controls['Security'].value);
            this.FormData.set('Security_Code', this.Form.controls['Security_Code'].value);
            this.FormData.set('Description', this.Form.controls['Description'].value);
            this.FormData.set('Location', this.Form.controls['Location'].value);
            this.FormData.set('Web', this.Form.controls['Web'].value);
            this.FormData.set('Mail', this.Form.controls['Mail'].value);
            this.FormData.set('Contact', this.Form.controls['Contact'].value);

            this.Service.Create_Cube(this.FormData).subscribe( datas => {
              if (datas['Status'] === 'True') {
                  if (datas['Output'] === 'True') {
                    //   this.snackBar.open( 'Cube Successfully Created' , ' ', {
                    //   horizontalPosition: 'center',
                    //   duration: 3000,
                    //   verticalPosition: 'top',
                    //   });
                      this.onClose.next({ Status: 'Success' , Response: datas['Response'] });
                      this._bsModalRef.hide();
                  } else {
                    //   this.snackBar.open( datas['Message'] , ' ', {
                    //   horizontalPosition: 'center',
                    //   duration: 3000,
                    //   verticalPosition: 'top',
                    //   });
                      this.onClose.next({ Staus: 'Filed'});
                      this._bsModalRef.hide();
                  }
              } else {
                //   this.snackBar.open( 'Cube Creation Failed Please Try Again !!', ' ', {
                //   horizontalPosition: 'center',
                //   duration: 3000,
                //   verticalPosition: 'top',
                //   });
                  this.onClose.next({ Staus: 'Error'});
                  this._bsModalRef.hide();
              }
          });
        }

    }

    close() {
        this.onClose.next({ Staus: 'Closed'});
        this._bsModalRef.hide();
    }

}
