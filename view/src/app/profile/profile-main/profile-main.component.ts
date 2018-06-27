import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-main',
  templateUrl: './profile-main.component.html',
  styleUrls: ['./profile-main.component.css']
})
export class ProfileMainComponent implements OnInit {

  Active_Tab = 'Highlights';

  constructor() { }

  ngOnInit() {
  }

  ChangeActiveTab(name) {
    if (name !== this.Active_Tab) {
      this.Active_Tab = name;
    }
  }

}
