import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { DataSharedVarServiceService } from './../service/data-shared-var-service/data-shared-var-service.service';


@Component({
  selector: 'app-invite-cube-redirection',
  templateUrl: './invite-cube-redirection.component.html',
  styleUrls: ['./invite-cube-redirection.component.css']
})
export class InviteCubeRedirectionComponent implements OnInit {

    constructor(
            private active_route: ActivatedRoute,
            public snackBar: MatSnackBar,
            private router: Router,
            private ShareingService: DataSharedVarServiceService,
        ) {
            const Cube_Id = this.active_route.snapshot.params['Cube_Id'];
            this.ShareingService.SetInviteRoute(Cube_Id);
            if (localStorage.getItem('CurrentUser')) {
              const LoginDate = new Date(atob(localStorage.getItem('UserToken'))).getTime();
              const NewDate = new Date().getTime();
              const time = NewDate - LoginDate;
              const diffInHours: number = time / 1000 / 60 / 60;
              if (diffInHours < 2) {
                  this.router.navigate(['Cube_View', Cube_Id ]);
              } else {
                  this.ShareingService.SetActiveSinInsignUpTab('SingIn', JSON.parse(localStorage.getItem('CurrentUser')).UserEmail);
                  localStorage.removeItem('CurrentUser');
                  localStorage.removeItem('UserToken');
                  this.router.navigate(['/']);
              }

          } else {
              this.ShareingService.SetActiveSinInsignUpTab('SingIn');
              this.router.navigate(['/']);
          }
          }

  ngOnInit() {
  }

}
