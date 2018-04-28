import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CreateCubeComponent } from './../Modal_Components/create-cube/create-cube.component';
import { JoinConfirmationComponent } from './../Modal_Components/join-confirmation/join-confirmation.component';

import { CubeService } from './../service/cube/cube.service';
import { DataSharedVarServiceService } from './../service/data-shared-var-service/data-shared-var-service.service';

@Component({
  selector: 'app-cubes-list',
  templateUrl: './cubes-list.component.html',
  styleUrls: ['./cubes-list.component.css']
})
export class CubesListComponent implements OnInit {

  modalRef: BsModalRef;

  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';

  Cubes_List;
  LoginUser;
  Category_Name;
  Category_Info;

  constructor(private modalService: BsModalService,
              private router: Router,
              private Service: CubeService,
              private ShareingService: DataSharedVarServiceService ) {
                this.Category_Name = this.ShareingService.GetCategory_Id()['Category_Name'];
                this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
              }

  ngOnInit() {
    const Category_Id = this.ShareingService.GetCategory_Id()['Category_Id'];
    if (Category_Id !== '') {
      this.Service.Cubes_List(Category_Id, this.LoginUser._id).subscribe( datas => {
        if (datas['Status'] === 'True') {
          this.Cubes_List = datas['Response'];
        } else {
          this.router.navigate(['Categories']);
        }
      });
          this.Service.Category_Info(Category_Id).subscribe( datas => {
      if (datas['Status'] === 'True') {
        this.Category_Info = datas['Response'];
      }
    });
    } else {
      this.router.navigate(['Categories']);
    }

  }

  openConfirmDialog() {
    const initialState = { data: { Category_Info : this.Category_Info } };
      this.modalRef = this.modalService.show(CreateCubeComponent, Object.assign({initialState}, { class: 'maxWidth700' }));
      this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Success') {
          this.router.navigate(['Cube_View', result.Response._id]);
        }
      });
  }

  JoinCodeGet(Cube_Index) {
    const initialState = { data: { Cube_Info:  this.Cubes_List[Cube_Index] } };
      this.modalRef = this.modalService.show(JoinConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth350' }));
      this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Success') {
          this.Cubes_List.splice(Cube_Index, 1);
        }
      });
  }

  DirectJoin(Cube_Index) {
    const data = { User_Id: this.LoginUser._id, Cube_Id: this.Cubes_List[Cube_Index]._id };
        this.Service.Follow_Cube(data).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
              this.Cubes_List.splice(Cube_Index, 1);
          }
      });
  }

  backtocategories() {
    this.router.navigate(['Categories']);
  }

  gotofeed() {
    this.router.navigate(['Cube_Posts']);
  }

}
