import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { DataSharedVarServiceService } from './../service/data-shared-var-service/data-shared-var-service.service';


@Component({
  selector: 'app-password-reset-redirection',
  templateUrl: './password-reset-redirection.component.html',
  styleUrls: ['./password-reset-redirection.component.css']
})
export class PasswordResetRedirectionComponent implements OnInit {

  constructor(
      private active_route: ActivatedRoute,
      public snackBar: MatSnackBar,
      private router: Router,
      private ShareingService: DataSharedVarServiceService,
  ) {
      const User_Id = this.active_route.snapshot.params['User_Id'];
      const Token = this.active_route.snapshot.params['Token'];
      this.ShareingService.SetPasswordResetRoute(User_Id, Token);
      if (localStorage.getItem('CurrentUser')) {
        const LoginDate = new Date(atob(localStorage.getItem('UserToken'))).getTime();
        const NewDate = new Date().getTime();
        const time = NewDate - LoginDate;
        const diffInHours: number = time / 1000 / 60 / 60;
        if (diffInHours < 2) {
            this.router.navigate(['Cube_Posts']);
        } else {
            localStorage.removeItem('CurrentUser');
            localStorage.removeItem('UserToken');
            this.router.navigate(['/']);
        }
    } else {
        this.router.navigate(['/']);
    }
  }

  ngOnInit() {
  }

}
