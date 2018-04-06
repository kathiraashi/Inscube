import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  ActiveTab = 'Register';

  SliderImages: any[];

  constructor(private router: Router) { }

  ngOnInit() {
    this.SliderImages = [];
        this.SliderImages.push({source: 'assets/images/s1.png', alt: '', title: '1'});
        this.SliderImages.push({source: 'assets/images/s2.png', alt: '', title: '2'});
        this.SliderImages.push({source: 'assets/images/s3.png', alt: '', title: '3'});
        this.SliderImages.push({source: 'assets/images/s4.png', alt: '', title: '4'});
        this.SliderImages.push({source: 'assets/images/s5.png', alt: '', title: '5'});
        this.SliderImages.push({source: 'assets/images/s6.png', alt: '', title: '6'});
  }

  ActiveTabchange(name) {
    if (name !== this.ActiveTab ) {
      this.ActiveTab = name;
    }
  }

  Register_Now() {
    this.router.navigate(['Profile_Completion']);
  }

}
