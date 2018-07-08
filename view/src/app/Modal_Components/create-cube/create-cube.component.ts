import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import { MatSnackBar } from '@angular/material';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { NgxCarousel } from 'ngx-carousel';

import { CubeService } from './../../service/cube/cube.service';

import { SigninSignupService } from './../../service/signin-signup/signin-signup.service';

@Component({
  selector: 'app-create-cube',
  templateUrl: './create-cube.component.html',
  styleUrls: ['./create-cube.component.css']
})
export class CreateCubeComponent implements OnInit {


  CategoryBaseUrl = 'http://localhost:4000/API/Uploads/Category/';

  data: Object;
  Locatin_Input: Boolean = false;
  Website_Input: Boolean = false;
  Email_Input: Boolean = false;
  Contact_Input: Boolean = false;

  onClose: Subject<Object>;

  SecurityType: String = 'Open';
  SecurityCode: Boolean = false;

  public Category_List: Array<any> = [];
  public carouselTile: NgxCarousel;

  @ViewChild('fileInput') fileInput: ElementRef;

  LoginUser;
  Default_Image;
  Form: FormGroup;
  FormData: FormData = new FormData;
  Show_Img_Preview: Boolean = false;
  Preview_Img: any ;

  AllCountry: any[];
  countries: any[];

  AllStateOfCountry: any[];
  states: any[];

  AllCityOfState: string;
  cities: any[];

  ActiveCategory;

  constructor(  public _bsModalRef: BsModalRef,
                private router: Router,
                private formBuilder: FormBuilder,
                private Service: CubeService,
                private Location_Service: SigninSignupService,
                public snackBar: MatSnackBar ) {
        this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
  }

  ngOnInit(): void {
        this.onClose = new Subject();
        this.Form = this.formBuilder.group({
            User_Id: new FormControl(this.LoginUser._id, Validators.required),
            Category_Id: new FormControl('', Validators.required),
            Name: new FormControl('', Validators.required),
            Security: new FormControl('', Validators.required),
            Security_Code: new FormControl(''),
            Description: new FormControl(''),
            Country: new FormControl(''),
            State: new FormControl(''),
            City: new FormControl(''),
            Web: new FormControl(''),
            Mail: new FormControl(''),
            Contact: new FormControl('')
        });

        this.Service.Category_List().subscribe( datas => {
            if (datas['Status'] === 'True') {
              this.Category_List = datas['Response'];
              this.Chanage_Category(0);
            }
          });

        this.carouselTile = {
            grid: { xs: 3, sm: 3, md: 4, lg: 4, all: 0 },
            speed: 600,
            interval: 3000,
            point: {
            visible: false,
            },
            load: 2,
            touch: true
        };

  }

  Chanage_Category(_index) {
    this.Category_List.map(v => { v.selected = false; });
    this.Category_List[_index].selected = true;
    this.ActiveCategory = this.Category_List[_index];
    this.Form.controls['Category_Id'].setValue(this.ActiveCategory._id);
  }

    View_Location_Input( ) {
        if (this.Locatin_Input) {
            this.Locatin_Input = false;
            this.Form.controls['Country'].setValue('');
            this.Form.controls['State'].setValue('');
            this.Form.controls['City'].setValue('');
        } else {
            this.Locatin_Input = true;
            this.Location_Service.Country_List().subscribe( country => {
                if (country['Status'] === 'True' && country['Output'] === 'True') {
                    this.AllCountry = country['Response'];
                }
              });
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


    // County Filter And Select
    filterCountry(_event) {
        const query = _event.query;
        const filtered: any[] = [];
        for (let i = 0; i < this.AllCountry.length; i++) {
        const country = this.AllCountry[i];
        if (country['Country_Name'].toLowerCase().indexOf(query.toLowerCase()) === 0) {
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
        this.Location_Service.State_List(this.Form.controls['Country'].value['_id']).subscribe( state => {
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
        if (state['State_Name'].toLowerCase().indexOf(query.toLowerCase()) === 0) {
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
        this.Location_Service.City_List(this.Form.controls['State'].value['_id']).subscribe( city => {
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
        if (city['City_Name'].toLowerCase().indexOf(query.toLowerCase()) === 0) {
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

        if ( this.Form.valid ) {
            this.FormData.set('User_Id', this.Form.controls['User_Id'].value);
            this.FormData.set('Category_Id', this.Form.controls['Category_Id'].value);
            this.FormData.set('Name', this.Form.controls['Name'].value);
            this.FormData.set('Security', this.Form.controls['Security'].value);
            this.FormData.set('Security_Code', this.Form.controls['Security_Code'].value);
            this.FormData.set('Description', this.Form.controls['Description'].value);
            this.FormData.set('City', JSON.stringify(this.Form.controls['City'].value));
            this.FormData.set('Country', JSON.stringify(this.Form.controls['Country'].value));
            this.FormData.set('State', JSON.stringify(this.Form.controls['State'].value));
            this.FormData.set('Web', this.Form.controls['Web'].value);
            this.FormData.set('Mail', this.Form.controls['Mail'].value);
            this.FormData.set('Contact', this.Form.controls['Contact'].value);

            this.Service.Create_Cube(this.FormData).subscribe( datas => {
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
