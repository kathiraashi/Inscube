import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CreatePostComponent } from './../../Modal_Components/create-post/create-post.component';
import { ViewAllCubesComponent } from './../../Modal_Components/view-all-cubes/view-all-cubes.component';
import { DiscoverCubesComponent } from './../../Modal_Components/discover-cubes/discover-cubes.component';

import { CubeService } from './../../service/cube/cube.service';

@Component({
  selector: 'app-feeds-left',
  templateUrl: './feeds-left.component.html',
  styleUrls: ['./feeds-left.component.css']
})
export class FeedsLeftComponent implements OnInit {

  modalRef: BsModalRef;

  CategoryBaseUrl = 'http://206.189.92.174:80/API/Uploads/Category/';
  UsersBaseUrl = 'http://206.189.92.174:80/API/Uploads/Users/';
  CubeBaseUrl = 'http://206.189.92.174:80/API/Uploads/Cubes/';

  LoginUser;
  Cubes_List: any[] = [];
  User_Cubes_List: any[] = [];

  Loader_1: Boolean = true;
  Loader_2: Boolean = true;

  constructor( private modalService: BsModalService,
               private router: Router,
               private Cube_Service: CubeService) {
                this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));

                this.Cube_Service.User_Followed_Cubes(this.LoginUser._id).subscribe( datas => {
                  this.Loader_1 = false;
                    if (datas['Status'] === 'True') {
                        this.Cubes_List = datas['Response'];
                    }
                });
                this.Cube_Service.User_Cubes(this.LoginUser._id).subscribe( datas => {
                  this.Loader_2 = false;
                    if (datas['Status'] === 'True') {
                        this.User_Cubes_List = datas['Response'];
                    }
                });
               }

  ngOnInit( ) {
  }

  PostCreate_Model() {
    const initialState = { title: 'Modal with component' };
      this.modalRef = this.modalService.show(CreatePostComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
      this.modalRef.content.onClose.subscribe(result => {
         this.router.navigate(['Cube_Posts']);
      });
  }

  View_All_MyCubes() {
    const initialState = {data : { Type: 1, Title : 'My cubes', User_Id : this.LoginUser._id } };
      this.modalRef = this.modalService.show( ViewAllCubesComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
      this.modalRef.content.onClose.subscribe(result => {
         console.log(result);
      });
  }
  View_All_MemberOf() {
    const initialState = {data : { Type: 2, Title : 'Member of', User_Id : this.LoginUser._id } };
    this.modalRef = this.modalService.show( ViewAllCubesComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
    this.modalRef.content.onClose.subscribe(result => {
       console.log(result);
    });
  }

  Discover_Model() {
    const initialState = {data : { Type: 2, Title : 'Member of', User_Id : this.LoginUser._id } };
    this.modalRef = this.modalService.show( DiscoverCubesComponent, Object.assign({initialState}, { class: 'maxWidth850 modal-lg' }));
    this.modalRef.content.onClose.subscribe(result => {
       console.log(result);
    });
  }
}
