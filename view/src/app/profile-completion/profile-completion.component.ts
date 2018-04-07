import { Component, OnInit } from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import 'rxjs/add/observable/of';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-completion',
  templateUrl: './profile-completion.component.html',
  styleUrls: ['./profile-completion.component.css']
})
export class ProfileCompletionComponent implements OnInit {

  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';

  colorTheme = 'theme-red';
  bsConfig: Partial<BsDatepickerConfig>;
  Gender;
  selectedGender;

  selectedCountry: string;
  countries: string[] = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
  ];

  selectedCities: string;
  cities: string[] = [
    'California',
    'Colorado',
    'Connecticut',
  ];

  constructor( private router: Router ) {
        this.bsConfig = Object.assign({}, { containerClass: this.colorTheme, dateInputFormat: 'DD/MM/YYYY' });
        this.Gender = [{name: 'Male'}, {name: 'Female'}, {name: 'Others'}, {name: 'Not Specify'}];
  }

  ngOnInit() {
  }

  Complete_Now() {
    this.router.navigate(['Categories']);
 }

}
