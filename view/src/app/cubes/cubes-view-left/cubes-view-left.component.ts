import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CreatePostComponent } from './../../Modal_Components/create-post/create-post.component';

import { CubeService } from './../../service/cube/cube.service';

@Component({
  selector: 'app-cubes-view-left',
  templateUrl: './cubes-view-left.component.html',
  styleUrls: ['./cubes-view-left.component.css']
})
export class CubesViewLeftComponent implements OnInit {


  modalRef: BsModalRef;

  CategoryBaseUrl = 'http://localhost:3000/API/Uploads/Category/';
  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';

  LoginUser;
  Cubes_List: any[] = [];
  User_Cubes_List: any[] = [];
  Cube_Id;
  Cube_Info;

  constructor(private route: ActivatedRoute,
              private modalService: BsModalService,
              private router: Router,
              private Cube_Service: CubeService
            ) {
              this.Cube_Id = route.snapshot.params['Cube_Id'];
              this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));

                this.Cube_Service.View_Cube(this.Cube_Id, this.LoginUser._id).subscribe( datas => {
                    if (datas['Status'] === 'True') {
                        this.Cube_Info = datas['Response'];
                    }
                });
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
