import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feeds-main',
  templateUrl: './feeds-main.component.html',
  styleUrls: ['./feeds-main.component.css']
})
export class FeedsMainComponent implements OnInit {

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
