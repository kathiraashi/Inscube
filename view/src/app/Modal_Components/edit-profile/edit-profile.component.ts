import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { MatSnackBar } from '@angular/material';

import { SigninSignupService } from './../../service/signin-signup/signin-signup.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';

  colorTheme = 'theme-red';
  bsConfig: Partial<BsDatepickerConfig>;
  Gender_List;
  selectedGender;

  selectedCountry: string;
  countries: string[] = [
    // 'Alabama',
    // 'Alaska',
    // 'Arizona',
    // 'Arkansas',
  ];

  selectedCities: string;
  cities: string[] = [
    // 'California',
    // 'Colorado',
    // 'Connecticut',
  ];

  @ViewChild('fileInput') fileInput: ElementRef;

  onClose: Subject<Object>;

  data;

  LoginUser;
  Form: FormGroup;
  FormData: FormData = new FormData;
  Show_Img_Preview: Boolean = false;
  Preview_Img: any ;

  bsValue = new Date();

  constructor(  private router: Router,
                public _bsModalRef: BsModalRef,
                private formBuilder: FormBuilder,
                private Service: SigninSignupService,
                public snackBar: MatSnackBar ) {
        this.bsConfig = Object.assign({}, { containerClass: this.colorTheme, dateInputFormat: 'DD/MM/YYYY' });
        this.Gender_List = [{name: 'Male'}, {name: 'Female'}, {name: 'Others'}, {name: 'Not specify'}];
        this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
  }

  ngOnInit() {
    this.onClose = new Subject();

    this.Form = this.formBuilder.group({
      User_Id: new FormControl(this.data.User_Info._id, Validators.required),
      Color_Code: new FormControl(this.data.User_Info.Color_Code,  Validators.required),
      DOB: new FormControl(new Date(this.data.User_Info.DOB)),
      City: new FormControl(),
      Country: new FormControl(),
      Gender: new FormControl(),
      Hash_Tag_1: new FormControl(this.data.User_Info.Hash_Tag_1),
      Hash_Tag_2: new FormControl(this.data.User_Info.Hash_Tag_2),
      Hash_Tag_3: new FormControl(this.data.User_Info.Hash_Tag_3)
    });

    this.selectedCountry = this.data.User_Info.Country;
    this.selectedCities = this.data.User_Info.City;
    this.selectedGender = {name: this.data.User_Info.Gender };
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
    let Gender_value = '';
    let City_value = '';
    let Country_value = '';

    if (this.Form.controls['Gender'].value !== undefined) {
      Gender_value = this.Form.controls['Gender'].value.name;
    }
    if (this.Form.controls['City'].value !== undefined) {
      City_value = this.Form.controls['City'].value;
    }
    if (this.Form.controls['Country'].value !== undefined) {
      Country_value = this.Form.controls['Country'].value;
    }


      this.FormData.set('User_Id', this.Form.controls['User_Id'].value);
      this.FormData.set('Color_Code', this.Form.controls['Color_Code'].value);
      this.FormData.set('DOB', this.Form.controls['DOB'].value);
      this.FormData.set('Hash_Tag_1', this.Form.controls['Hash_Tag_1'].value);
      this.FormData.set('Hash_Tag_2', this.Form.controls['Hash_Tag_2'].value);
      this.FormData.set('Hash_Tag_3', this.Form.controls['Hash_Tag_3'].value);
      this.FormData.set('City', City_value);
      this.FormData.set('Country', Country_value);
      this.FormData.set('Gender', Gender_value);
      this.Service.Register_Completion(this.FormData).subscribe( datas => {
        if (datas['Status'] === 'True') {
          if (datas['Output'] === 'True') {
            this.snackBar.open( 'Profile successfully updated' , ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
            this.onClose.next({Status: true, Response: datas['Response'] });
            this._bsModalRef.hide();
          } else {
            this.snackBar.open( datas['Message'] , ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          }
      } else {
        this.snackBar.open( 'Profile update failed please try again !!', ' ', {
          horizontalPosition: 'center',
          duration: 3000,
          verticalPosition: 'top',
        });
      }
       });
    }

}
