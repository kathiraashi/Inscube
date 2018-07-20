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

  UsersBaseUrl = 'http://localhost:4000/API/Uploads/Users/';

  colorTheme = 'theme-red';
  bsConfig: Partial<BsDatepickerConfig>;
  Gender_List;
  selectedGender;

  AllCountry: any[];
  countries: any[];

  AllStateOfCountry: any[];
  states: any[];

  AllCityOfState: string;
  cities: any[];

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
        this.Service.Country_List().subscribe( country => {
          if (country['Status'] === 'True' && country['Output'] === 'True') {
              this.AllCountry = country['Response'];
          }
        });
  }

  ngOnInit() {
    this.onClose = new Subject();

    this.Form = this.formBuilder.group({
      User_Id: new FormControl(this.data.User_Info._id, Validators.required),
      Color_Code: new FormControl(this.data.User_Info.Color_Code,  Validators.required),
      DOB: new FormControl(new Date(this.data.User_Info.DOB)),
      City: new FormControl(this.data.User_Info.City),
      State: new FormControl(this.data.User_Info.State),
      Country: new FormControl(this.data.User_Info.Country, Validators.required),
      Gender: new FormControl(),
      Hash_Tag_1: new FormControl(this.data.User_Info.Hash_Tag_1),
      Hash_Tag_2: new FormControl(this.data.User_Info.Hash_Tag_2),
      Hash_Tag_3: new FormControl(this.data.User_Info.Hash_Tag_3)
    });
    this.selectedGender = {name: this.data.User_Info.Gender };

    if ( this.data.User_Info.Country && typeof(this.data.User_Info.Country) === 'object' && Object.keys(this.data.User_Info.Country).length > 0 ) {
      this.Service.State_List(this.data.User_Info.Country['_id']).subscribe( state => {
        if (state['Status'] === 'True' && state['Output'] === 'True') {
            this.AllStateOfCountry = state['Response'];
        }
      });
    }

    if ( this.data.User_Info.State && typeof(this.data.User_Info.State) === 'object' && Object.keys(this.data.User_Info.State).length > 0) {
      this.Service.City_List(this.data.User_Info.State['_id']).subscribe( state => {
        if (state['Status'] === 'True' && state['Output'] === 'True') {
            this.AllCityOfState = state['Response'];
        }
      });
    }

  }


  // County Filter And Select
  filterCountry(_event) {
    const query = _event.query;
    const filtered: any[] = [];
    for (let i = 0; i < this.AllCountry.length; i++) {
      const country = this.AllCountry[i];
      if (country['Country_Name'].toLowerCase().includes(query.toLowerCase())) {
            filtered.push(country);
      }
    }
    this.countries = filtered;
  }
  CountryOnBlur(_value) {
    if (typeof(this.Form.controls['Country'].value) !== 'object') {
      this.Form.controls['Country'].setValue('');
      this.Form.controls['State'].setValue('');
      this.Form.controls['City'].setValue('');
    }
  }
  CountryOnSelect(_value) {
    this.Form.controls['State'].setValue('');
    this.Form.controls['City'].setValue('');
    this.Service.State_List(this.Form.controls['Country'].value['_id']).subscribe( state => {
      if (state['Status'] === 'True' && state['Output'] === 'True') {
          this.AllStateOfCountry = state['Response'];
      }
    });
  }


  // State Filter And Select
  filterState(_event) {
    const query = _event.query;
    const filtered: any[] = [];
    for (let i = 0; i < this.AllStateOfCountry.length; i++) {
      const state = this.AllStateOfCountry[i];
      if (state['State_Name'].toLowerCase().includes(query.toLowerCase())) {
            filtered.push(state);
      }
    }
    this.states = filtered;
  }
  StateOnBlur(_value) {
    if (typeof(this.Form.controls['State'].value) !== 'object') {
      this.Form.controls['State'].setValue('');
      this.Form.controls['City'].setValue('');
    }
  }
  StateOnSelect(_value) {
    this.Form.controls['City'].setValue('');
    this.Service.City_List(this.Form.controls['State'].value['_id']).subscribe( city => {
      if (city['Status'] === 'True' && city['Output'] === 'True') {
          this.AllCityOfState = city['Response'];
      }
    });
  }

  // State Filter And Select
  filterCity(_event) {
    const query = _event.query;
    const filtered: any[] = [];
    for (let i = 0; i < this.AllCityOfState.length; i++) {
      const city = this.AllCityOfState[i];
      if (city['City_Name'].toLowerCase().includes(query.toLowerCase())) {
            filtered.push(city);
      }
    }
    this.cities = filtered;
  }
  CityOnBlur(_value) {
    if (typeof(this.Form.controls['City'].value) !== 'object') {
      this.Form.controls['City'].setValue('');
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
    let Gender_value = '';

    if (this.Form.controls['Gender'].value !== undefined) {
      Gender_value = this.Form.controls['Gender'].value.name;
    }



      this.FormData.set('User_Id', this.Form.controls['User_Id'].value);
      this.FormData.set('Color_Code', this.Form.controls['Color_Code'].value);
      this.FormData.set('DOB', this.Form.controls['DOB'].value);
      this.FormData.set('Hash_Tag_1', this.Form.controls['Hash_Tag_1'].value);
      this.FormData.set('Hash_Tag_2', this.Form.controls['Hash_Tag_2'].value);
      this.FormData.set('Hash_Tag_3', this.Form.controls['Hash_Tag_3'].value);
      this.FormData.set('City', JSON.stringify(this.Form.controls['City'].value));
      this.FormData.set('Country', JSON.stringify(this.Form.controls['Country'].value));
      this.FormData.set('State', JSON.stringify(this.Form.controls['State'].value));
      this.FormData.set('Gender', Gender_value);
      this.Service.Register_Completion(this.FormData).subscribe( datas => {
        if (datas['Status'] === 'True') {
          if (datas['Output'] === 'True') {
            this.onClose.next({Status: true, Response: datas['Response'] });
            this._bsModalRef.hide();
          } else {
            this.snackBar.open( datas['Message'] , ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          }
      }
       });
    }

}
