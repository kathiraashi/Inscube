import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-completion',
  templateUrl: './profile-completion.component.html',
  styleUrls: ['./profile-completion.component.css']
})
export class ProfileCompletionComponent implements OnInit {

  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';

  constructor() { }

  ngOnInit() {
  }

}
