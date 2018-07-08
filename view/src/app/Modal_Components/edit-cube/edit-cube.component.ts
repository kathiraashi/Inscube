import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import { MatSnackBar } from '@angular/material';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CubeService } from './../../service/cube/cube.service';

import { SigninSignupService } from './../../service/signin-signup/signin-signup.service';

@Component({
  selector: 'app-edit-cube',
  templateUrl: './edit-cube.component.html',
  styleUrls: ['./edit-cube.component.css']
})
export class EditCubeComponent implements OnInit {


  CategoryBaseUrl = 'http://localhost:4000/API/Uploads/Category/';
  CubeBaseUrl = 'http://localhost:4000/API/Uploads/Cubes/';

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


  AllCountry: any[];
  countries: any[];

  AllStateOfCountry: any[];
  states: any[];

  AllCityOfState: string;
  cities: any[];

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
        this.Default_Image = this.data['Cube_Info'].Image;
        this.Form = this.formBuilder.group({
            Cube_Id: new FormControl(this.data['Cube_Info']._id, Validators.required),
            User_Id: new FormControl(this.LoginUser._id, Validators.required),
            Category_Id: new FormControl(this.data['Cube_Info'].Category_Id, Validators.required),
            Name: new FormControl(this.data['Cube_Info'].Name, Validators.required),
            Security: new FormControl(this.data['Cube_Info'].Security, Validators.required),
            Security_Code: new FormControl(this.data['Cube_Info'].Security_Code),
            Description: new FormControl(this.data['Cube_Info'].Description),

            Country: new FormControl(this.data['Cube_Info'].Country),
            State: new FormControl(this.data['Cube_Info'].State),
            City: new FormControl(this.data['Cube_Info'].City),

            Web: new FormControl(this.data['Cube_Info'].Web),
            Mail: new FormControl(this.data['Cube_Info'].Mail),
            Contact: new FormControl(this.data['Cube_Info'].Contact)
        });

        this.SecurityType = this.data['Cube_Info'].Security;
        if ( this.data['Cube_Info'].Security === 'Close') { this.SecurityCode = true; }
        if (this.data['Cube_Info'].Country && this.data['Cube_Info'].Country['Country_Name'] !== '') { this.Locatin_Input = true; }
        if (this.data['Cube_Info'].Web !== '') { this.Website_Input = true; }
        if (this.data['Cube_Info'].Mail !== '') { this.Email_Input = true; }
        if (this.data['Cube_Info'].Contact !== '') { this.Contact_Input = true; }

        this.Location_Service.Country_List().subscribe( country => {
            if (country['Status'] === 'True' && country['Output'] === 'True') {
                this.AllCountry = country['Response'];
            }
        });

        if ( this.data['Cube_Info'].Country && typeof(this.data['Cube_Info'].Country) === 'object' && Object.keys(this.data['Cube_Info'].Country).length > 0 ) {
            this.Location_Service.State_List(this.data['Cube_Info'].Country['_id']).subscribe( state => {
              if (state['Status'] === 'True' && state['Output'] === 'True') {
                  this.AllStateOfCountry = state['Response'];
              }
            });
          }

          if ( this.data['Cube_Info'].State && typeof(this.data['Cube_Info'].State) === 'object' && Object.keys(this.data['Cube_Info'].State).length > 0) {
            this.Location_Service.City_List(this.data['Cube_Info'].State['_id']).subscribe( state => {
              if (state['Status'] === 'True' && state['Output'] === 'True') {
                  this.AllCityOfState = state['Response'];
              }
            });
          }
  }

    View_Location_Input( ) {
        if (this.Locatin_Input) {
            this.Locatin_Input = false;
            this.Form.controls['Country'].setValue('');
            this.Form.controls['State'].setValue('');
            this.Form.controls['City'].setValue('');
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
            this.FormData.set('Cube_Id', this.Form.controls['Cube_Id'].value);
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
