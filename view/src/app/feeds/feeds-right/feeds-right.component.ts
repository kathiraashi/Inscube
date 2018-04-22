import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CubeService } from './../../service/cube/cube.service';

import { JoinConfirmationComponent } from './../../Modal_Components/join-confirmation/join-confirmation.component';
import { DiscoverCubesComponent } from './../../Modal_Components/discover-cubes/discover-cubes.component';

@Component({
  selector: 'app-feeds-right',
  templateUrl: './feeds-right.component.html',
  styleUrls: ['./feeds-right.component.css']
})
export class FeedsRightComponent implements OnInit {

  modalRef: BsModalRef;

  CategoryBaseUrl = 'http://206.189.92.174:80/API/Uploads/Category/';
  UsersBaseUrl = 'http://206.189.92.174:80/API/Uploads/Users/';
  CubeBaseUrl = 'http://206.189.92.174:80/API/Uploads/Cubes/';

  LoginUser;
  Cubes_List: any[] = [];
  Loader_1: Boolean = true;

  constructor(  private modalService: BsModalService,
                private router: Router,
                private Cube_Service: CubeService) {
                  this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
                  this.Cube_Service.User_UnFollowed_Cubes(this.LoginUser._id).subscribe( datas => {
                    this.Loader_1 = false;
                      if (datas['Status'] === 'True') {
                          this.Cubes_List = datas['Response'];
                      }
                  });
                 }


  ngOnInit() {
  }

    JoinCodeGet(Cube_Index) {
    const initialState = { data: { Cube_Info:  this.Cubes_List[Cube_Index] } };
      this.modalRef = this.modalService.show(JoinConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth400' }));
      this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Success') {
          this.Cubes_List.splice(Cube_Index, 1);
        }
      });
  }

  DirectJoin(Cube_Index) {
    const data = { User_Id: this.LoginUser._id, Cube_Id: this.Cubes_List[Cube_Index]._id };
        this.Cube_Service.Follow_Cube(data).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
              this.Cubes_List.splice(Cube_Index, 1);
          }
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
