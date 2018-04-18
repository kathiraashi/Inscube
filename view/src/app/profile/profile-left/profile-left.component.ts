import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CreatePostComponent } from './../../Modal_Components/create-post/create-post.component';
import { ViewAllCubesComponent } from './../../Modal_Components/view-all-cubes/view-all-cubes.component';
import { EditProfileComponent } from './../../Modal_Components/edit-profile/edit-profile.component';
import { PrivacySettingsComponent } from './../../Modal_Components/privacy-settings/privacy-settings.component';
import { ChangePasswordComponent } from './../../Modal_Components/change-password/change-password.component';

import { CubeService } from './../../service/cube/cube.service';
import { SigninSignupService } from './../../service/signin-signup/signin-signup.service';

@Component({
  selector: 'app-profile-left',
  templateUrl: './profile-left.component.html',
  styleUrls: ['./profile-left.component.css']
})
export class ProfileLeftComponent implements OnInit {

  modalRef: BsModalRef;

  CategoryBaseUrl = 'http://localhost:3000/API/Uploads/Category/';
  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';

  LoginUser;
  Cubes_List: any[] = [];
  User_Cubes_List: any[] = [];

  User_Id;
  User_Info;

  Loader_1: Boolean = true;
  Loader_2: Boolean = true;

  constructor( private modalService: BsModalService,
               private router: Router,
               private Cube_Service: CubeService,
               private User_Service: SigninSignupService,
               private active_route: ActivatedRoute) {
                this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
                this.active_route.url.subscribe((u) => {
                  this.User_Id = this.active_route.snapshot.params['User_Id'];
                  this.User_Service.User_Info(this.User_Id).subscribe( datas => {
                    this.Loader_1 = false;
                      if (datas['Status'] === 'True') {
                          this.User_Info = datas['Response'];
                      }
                  });
                  this.Cube_Service.User_Followed_Cubes(this.User_Id).subscribe( datas => {
                    this.Loader_1 = false;
                      if (datas['Status'] === 'True') {
                          this.Cubes_List = datas['Response'];
                      }
                  });
                  this.Cube_Service.User_Cubes(this.User_Id).subscribe( datas => {
                    this.Loader_2 = false;
                      if (datas['Status'] === 'True') {
                          this.User_Cubes_List = datas['Response'];
                      }
                  });
                });
               }

  ngOnInit( ) {
  }

  View_All_MyCubes() {
    const initialState = {data : { Type: 1, Title : 'My cubes', User_Id : this.User_Id } };
      this.modalRef = this.modalService.show( ViewAllCubesComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
      this.modalRef.content.onClose.subscribe(result => {
         console.log(result);
      });
  }
  View_All_MemberOf() {
    const initialState = {data : { Type: 2, Title : 'Member of', User_Id : this.User_Id } };
    this.modalRef = this.modalService.show( ViewAllCubesComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
    this.modalRef.content.onClose.subscribe(result => {
       console.log(result);
    });
  }

  Edit_Model() {
    const initialState = {data : { User_Info : this.User_Info } };
    this.modalRef = this.modalService.show( EditProfileComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status) {
          this.User_Service.User_Info(this.User_Id).subscribe( datas => {
            this.Loader_1 = false;
              if (datas['Status'] === 'True') {
                  this.User_Info = datas['Response'];
              }
          });
      }
    });
  }


  privacy_model() {
    const initialState = {data : { User_Info : this.User_Info } };
    this.modalRef = this.modalService.show( PrivacySettingsComponent, Object.assign({initialState}, { class: 'modal-md' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status) {
          this.User_Service.User_Info(this.User_Id).subscribe( datas => {
            this.Loader_1 = false;
              if (datas['Status'] === 'True') {
                  this.User_Info = datas['Response'];
              }
          });
      }
    });
  }

  password_change() {
    const initialState = {data : { User_Info : this.User_Info } };
    this.modalRef = this.modalService.show( ChangePasswordComponent, Object.assign({initialState}, { class: 'modal-md' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status) {

      }
    });
  }






}
