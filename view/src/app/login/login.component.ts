import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { MatSnackBar } from '@angular/material';

import { DataSharedVarServiceService } from './../service/data-shared-var-service/data-shared-var-service.service';
import { SigninSignupService } from './../service/signin-signup/signin-signup.service';
import { CubeService } from './../service/cube/cube.service';

import { EmailVerificationComponent } from './../Modal_Components/email-verification/email-verification.component';
import { PasswordResetComponent } from './../Modal_Components/password-reset/password-reset.component';
import { AlertPrivacyUpdateComponent } from './../Modal_Components/alert-privacy-update/alert-privacy-update.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  modalRef: BsModalRef;

  ActiveTab = 'Register';
  ActiveTab_New: any;

  Register_Form_Valid: Boolean = false;
  Inscube_NameAvailabel: Boolean = false;
  Available_Ins_Name: String = '';
  EmailAvailabel: Boolean = false;
  EmailFormat_Error: Boolean = false;
  Inscube_NameNotAvailabel: Boolean = false;
  EmailNotAvailabel: Boolean = false;
  checkbox_Value: Boolean = false;

  RegisterForm: FormGroup;
  SignInForm: FormGroup;

  If_Invite;
  If_Password_Reset;

  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private Service: SigninSignupService,
              private ShareingService: DataSharedVarServiceService,
              public snackBar: MatSnackBar,
              private Cube_Service: CubeService,
              private modalService: BsModalService) {
                this.ActiveTab_New = this.ShareingService.GetActiveSinInsignUpTab();
                this.If_Invite = this.ShareingService.GetInviteRoute();
                this.If_Password_Reset = this.ShareingService.GetPasswordResetRoute();
               }

  ngOnInit() {
    this.RegisterForm = new FormGroup({
      Inscube_Name: new FormControl('', Validators.required),
      Email: new FormControl('', Validators.required),
      Password: new FormControl('',  Validators.required),
      checkbox: new FormControl('',  Validators.required),
    });

    this.SignInForm = new FormGroup({
      Email: new FormControl('', Validators.required),
      Password: new FormControl('',  Validators.required)
    });

    if (this.ActiveTab_New['ActiveTab'] === 'SingIn') {
      this.ActiveTab = 'Login';
      if (this.ActiveTab_New['Email'] !== '') {
        this.SignInForm.controls['Email'].setValue(this.ActiveTab_New['Email']);
      }
    } else {
      this.ActiveTab = 'Register';
      if (this.ActiveTab_New['Email'] !== '') {
        this.RegisterForm.controls['Email'].setValue(this.ActiveTab_New['Email']);
      }
    }

    if (this.If_Invite.CubeId !== '' ) {
      if ( (this.If_Invite.CubeId).length >= 24 ) {
        this.Cube_Service.Check_Invite_CubeId(this.If_Invite.CubeId).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            this.snackBar.open( 'Please login or register to join the cube', ' ', {
              horizontalPosition: 'center',
              duration: 5000,
              verticalPosition: 'top',
            });
          } else if (datas['Status'] === 'True' && datas['Output'] === 'False') {
            this.snackBar.open( 'Your invite cube is deleted!', ' ', {
              horizontalPosition: 'center',
              duration: 5000,
              verticalPosition: 'top',
            });
            this.If_Invite = this.ShareingService.SetInviteRoute('');
          }
        });
      } else {
        this.snackBar.open( 'Your invite url is invalid!', ' ', {
          horizontalPosition: 'center',
          duration: 5000,
          verticalPosition: 'top',
        });
        this.If_Invite = this.ShareingService.SetInviteRoute('');
      }
    }

    if (this.If_Password_Reset.UserId !== '' && this.If_Password_Reset.Token !== '' ) {
      if ( (this.If_Password_Reset.UserId).length >= 24 && (this.If_Password_Reset.Token).length > 0 ) {
        this.Service.password_reset_url_check(this.If_Password_Reset.UserId, this.If_Password_Reset.Token).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            const initialState = { data: { User_Info:  datas['Response'] } };
            this.modalRef = this.modalService.show(PasswordResetComponent, Object.assign(
              {initialState}, {ignoreBackdropClick: true, class: 'maxWidth450' }
            ));
            this.modalRef.content.onClose.subscribe(result => {
              console.log(result);
            });
          } else if (datas['Status'] === 'True' && datas['Output'] === 'False') {
            this.snackBar.open( 'Your password reset token is expired!', ' ', {
              horizontalPosition: 'center',
              duration: 5000,
              verticalPosition: 'top',
            });
            this.If_Invite = this.ShareingService.SetPasswordResetRoute('', '');
          }
        });
      } else {
        this.snackBar.open( 'Your password reset url is invalid!', ' ', {
          horizontalPosition: 'center',
          duration: 5000,
          verticalPosition: 'top',
        });
        this.If_Invite = this.ShareingService.SetPasswordResetRoute('', '');
      }
    }

  }

  ActiveTabchange(name) {
    if (name !== this.ActiveTab ) {
      this.ActiveTab = name;
    }
  }

  Check_Inscube_Name_Availabel() {
    if (this.RegisterForm.value.Inscube_Name !== '') {
      this.Service.NameValidate(this.RegisterForm.value.Inscube_Name).subscribe( datas => {
          if (datas['Available'] === 'True') {
            this.Inscube_NameAvailabel = true;
            this.Inscube_NameNotAvailabel = false;
            const Ins_Name = this.RegisterForm.value.Inscube_Name;
            this.Available_Ins_Name = Ins_Name.replace(/@/gi, '');
          } else {
            this.Inscube_NameAvailabel = false;
            this.Inscube_NameNotAvailabel = true;
            this.checkFormValidation();
          }
      });
    }
  }


  get Email() {
    return this.RegisterForm.get('Email');
  }

  Check_Email_Availabel() {
    if (this.RegisterForm.value.Email !== '') {
      this.Service.EmailValidate(this.RegisterForm.value.Email).subscribe( datas => {
        if (datas['Output'] === 'True') {
            this.EmailFormat_Error = false;
            if (datas['Available'] === 'False') {
              this.EmailAvailabel = false;
              this.EmailNotAvailabel = true;
            } else {
              this.EmailAvailabel = true;
              this.EmailNotAvailabel = false;
              this.checkFormValidation();
            }
        } else {
          this.EmailFormat_Error = true;
          this.EmailNotAvailabel = false;
          this.EmailAvailabel = false;
          this.checkFormValidation();
        }
      });
    }
  }

  checkFormValidation() {
    if ( this.RegisterForm.value.Inscube_Name !== '' &&
        this.RegisterForm.value.Email !== '' &&
        this.RegisterForm.value.Password !== '' &&
        this.RegisterForm.value.checkbox !== false &&
        this.Inscube_NameAvailabel && this.EmailAvailabel && this.RegisterForm.valid ) {
        this.Register_Form_Valid = true;
    } else {
        this.Register_Form_Valid = false;
    }
  }

  submit() {
    this.checkFormValidation();
    if (this.Register_Form_Valid) {
        this.Service.Register(this.RegisterForm.value).subscribe( datas => {
          if (datas['Status'] === 'True') {
              if (datas['Output'] === 'True') {
                this.router.navigate(['Profile_Completion']);
              }
          }
        });
      }
    }


  LoginFormsubmit() {
    if ( this.SignInForm.valid ) {

      this.Service.UserValidate(this.SignInForm.value)
      .subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
          this.Service.Privacy_Update_Check(datas['Response']._id).subscribe( Update_Info => {
            if (Update_Info['Status'] === 'True' && Update_Info['Output'] === 'True' && Update_Info['Response'] === 'Success') {
              if (this.If_Invite.CubeId !== '' ) {
                this.router.navigate(['Cube_View', this.If_Invite.CubeId ]);
              } else {
                this.router.navigate(['Cube_Posts']);
              }
            } else {
              this.modalRef = this.modalService.show(AlertPrivacyUpdateComponent, Object.assign({}, { class: 'maxWidth450' }));
              this.modalRef.content.onClose.subscribe(result => {
                if (result.Status === 'Yes') {
                  this.Service.Privacy_Update_Agree(datas['Response']._id).subscribe(_Info => {console.log(_Info);
                  });
                  if (this.If_Invite.CubeId !== '' ) {
                    this.router.navigate(['Cube_View', this.If_Invite.CubeId ]);
                  } else {
                    this.router.navigate(['Cube_Posts']);
                  }
                } else {
                  localStorage.removeItem('CurrentUser');
                  localStorage.removeItem('UserToken');
                }
              });
            }
          });
        } else {
          this.snackBar.open( datas['Message'] , ' ', {
            horizontalPosition: 'center',
            duration: 3000,
            verticalPosition: 'top',
          });
        }
       });
    }

  }


  ForgotPassword() {
    const initialState = { data: { Email:  this.RegisterForm.value.Email } };
      this.modalRef = this.modalService.show(EmailVerificationComponent, Object.assign({initialState}, { class: 'maxWidth450' }));
      this.modalRef.content.onClose.subscribe(result => {
        console.log(result);
      });
  }

}
