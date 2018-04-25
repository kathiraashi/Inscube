import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import { MatSnackBar } from '@angular/material';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CubeService } from './../../service/cube/cube.service';


@Component({
  selector: 'app-edit-cube',
  templateUrl: './edit-cube.component.html',
  styleUrls: ['./edit-cube.component.css']
})
export class EditCubeComponent implements OnInit {


  CategoryBaseUrl = 'http://www.inscube.com/API/Uploads/Category/';
  CubeBaseUrl = 'http://www.inscube.com/API/Uploads/Cubes/';

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
        this.Default_Image = this.data['Cube_Info'].Image;
        this.Form = this.formBuilder.group({
            Cube_Id: new FormControl(this.data['Cube_Info']._id, Validators.required),
            User_Id: new FormControl(this.LoginUser._id, Validators.required),
            Category_Id: new FormControl(this.data['Cube_Info'].Category_Id, Validators.required),
            Name: new FormControl(this.data['Cube_Info'].Name, Validators.required),
            Security: new FormControl(this.data['Cube_Info'].Security, Validators.required),
            Security_Code: new FormControl(this.data['Cube_Info'].Security_Code),
            Description: new FormControl(this.data['Cube_Info'].Description),
            Location: new FormControl(this.data['Cube_Info'].Location),
            Web: new FormControl(this.data['Cube_Info'].Web),
            Mail: new FormControl(this.data['Cube_Info'].Mail),
            Contact: new FormControl(this.data['Cube_Info'].Contact)
        });

        this.SecurityType = this.data['Cube_Info'].Security;
        if ( this.data['Cube_Info'].Security === 'Close') { this.SecurityCode = true; }
        if (this.data['Cube_Info'].Location !== '') { this.Locatin_Input = true; }
        if (this.data['Cube_Info'].Web !== '') { this.Website_Input = true; }
        if (this.data['Cube_Info'].Mail !== '') { this.Email_Input = true; }
        if (this.data['Cube_Info'].Contact !== '') { this.Contact_Input = true; }
  }

    View_Location_Input( ) {
        if (this.Locatin_Input) {
            this.Locatin_Input = false;
            this.Form.controls['Location'].setValue('');
        } else {
            this.Locatin_Input = true;
        }
    }
    View_Website_Input( ) {
        if (this.Website_Input) {
            this.Website_Input = false;
            this.Form.controls['Web'].setValue('');
        } else {
            this.Website_Input = true;
        }
    }
    View_Email_Input( ) {
        if (this.Email_Input) {
            this.Form.controls['Mail'].setValue('');
            this.Email_Input = false;
        } else {
            this.Email_Input = true;
        }
    }
    View_Contact_Input() {
        if (this.Contact_Input) {
            this.Contact_Input = false;
            this.Form.controls['Contact'].setValue('');
        } else {
            this.Contact_Input = true;
        }
    }
    radioChange(event) {
        if ( event.value === 'Close') {
            this.SecurityCode = true;
        } else {
            this.Form.controls['Security_Code'].setValue('');
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
            this.FormData.set('Cube_Id', this.Form.controls['Cube_Id'].value);
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

            this.Service.Update_Cube(this.FormData).subscribe( datas => {
              if (datas['Status'] === 'True') {
                  if (datas['Output'] === 'True') {
                      this.onClose.next({ Status: 'Success' , Response: datas['Response'] });
                      this._bsModalRef.hide();
                  } else {
                      this.onClose.next({ Staus: 'Filed'});
                      this._bsModalRef.hide();
                  }
              } else {
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
