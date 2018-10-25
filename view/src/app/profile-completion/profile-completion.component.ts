import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import 'rxjs/add/observable/of';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import { MatSnackBar } from '@angular/material';

import { SigninSignupService } from './../service/signin-signup/signin-signup.service';
import { DataSharedVarServiceService } from './../service/data-shared-var-service/data-shared-var-service.service';

@Component({
  selector: 'app-profile-completion',
  templateUrl: './profile-completion.component.html',
  styleUrls: ['./profile-completion.component.css']
})
export class ProfileCompletionComponent implements OnInit {

  UsersBaseUrl = 'http://localhost:4000/API/Uploads/Users/';

  colorTheme = 'theme-red';
  bsConfig: Partial<BsDatepickerConfig>;
  Gender_List;
  selectedGender;

  maxDate: Date = new Date('December 31, 1999');

  AllCountry: any[];
  countries: any[];

  states: any[];
  SelectedState;

  cities: any[];
  SelectedCity;

  @ViewChild('fileInput') fileInput: ElementRef;

  LoginUser;
  Form: FormGroup;
  FormData: FormData = new FormData;
  Show_Img_Preview: Boolean = false;
  Preview_Img: any ;

  If_Invite;

  constructor(  private router: Router,
                private formBuilder: FormBuilder,
                private Service: SigninSignupService,
                public snackBar: MatSnackBar,
                private ShareingService: DataSharedVarServiceService) {
        this.bsConfig = Object.assign({}, { containerClass: this.colorTheme, dateInputFormat: 'DD/MM/YYYY' });
        this.Gender_List = [{name: 'Male'}, {name: 'Female'}, {name: 'Others'}, {name: 'Not specify'}];
        this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
        this.If_Invite = this.ShareingService.GetInviteRoute();
        this.Service.Country_List().subscribe( country => {
          if (country['Status'] === 'True' && country['Output'] === 'True') {
              this.AllCountry = country['Response'];
          }
        });
  }

            ngOnInit() {
              this.Form = this.formBuilder.group({
                User_Id: new FormControl(this.LoginUser._id, Validators.required),
                Color_Code: new FormControl('color1',  Validators.required),
                DOB: new FormControl(''),
                Country: new FormControl('', Validators.required),
                State: new FormControl(''),
                City: new FormControl(''),
                Gender: new FormControl(''),
                Hash_Tag_1: new FormControl(''),
                Hash_Tag_2: new FormControl(''),
                Hash_Tag_3: new FormControl('')
              });
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
         this.states = [];
         this.cities = [];
      }
   }
   CountryOnSelect(_value) {
      this.Form.controls['State'].setValue('');
      this.Form.controls['City'].setValue('');
      this.Service.State_List(this.Form.controls['Country'].value['_id']).subscribe( state => {
         if (state['Status'] === 'True' && state['Output'] === 'True') {
            this.states = state['Response'];
         }
      });
   }


// State Filter And Select
   StateOnBlur() {
      if (typeof(this.Form.controls['Country'].value) !== 'object') {
         this.Form.controls['City'].setValue('');
         this.cities = [];
      }
   }
   StateOnSelect(_value) {
      this.Form.controls['City'].setValue('');
      if (typeof(this.Form.controls['Country'].value) === 'object') {
         this.Service.City_List(this.SelectedState['_id']).subscribe( city => {
            if (city['Status'] === 'True' && city['Output'] === 'True') {
               this.cities = city['Response'];
            }
         });
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

      this.FormData.set('Country', JSON.stringify(this.Form.controls['Country'].value));
      this.FormData.set('State', JSON.stringify(this.Form.controls['State'].value));
      this.FormData.set('City', JSON.stringify(this.Form.controls['City'].value));

      this.FormData.set('Gender', Gender_value);
      this.Service.Register_Completion(this.FormData).subscribe( datas => {
        if (datas['Status'] === 'True') {
          if (datas['Output'] === 'True') {
            if (this.If_Invite.CubeId !== '' ) {
              this.router.navigate(['Cube_View', this.If_Invite.CubeId ]);
            } else {
              this.router.navigate(['Categories']);
            }
          }
        }
      });
    }

}
