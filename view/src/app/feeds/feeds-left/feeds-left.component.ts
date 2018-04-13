import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CreatePostComponent } from './../../Modal_Components/create-post/create-post.component';

import { CubeService } from './../../service/cube/cube.service';

@Component({
  selector: 'app-feeds-left',
  templateUrl: './feeds-left.component.html',
  styleUrls: ['./feeds-left.component.css']
})
export class FeedsLeftComponent implements OnInit {

  modalRef: BsModalRef;

  CategoryBaseUrl = 'http://localhost:3000/API/Uploads/Category/';
  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';

  LoginUser;
  Cubes_List: any[] = [];
  User_Cubes_List: any[] = [];

  constructor( private modalService: BsModalService,
               private router: Router,
               private Cube_Service: CubeService) {
                this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
                this.Cube_Service.User_Followed_Cubes(this.LoginUser._id).subscribe( datas => {
                    if (datas['Status'] === 'True') {
                        this.Cubes_List = datas['Response'];
                    }
                });
                this.Cube_Service.User_Cubes(this.LoginUser._id).subscribe( datas => {
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

}
