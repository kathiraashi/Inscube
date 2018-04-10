import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CreateCubeComponent } from './../Modal_Components/create-cube/create-cube.component';

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

  lists;

  constructor(private modalService: BsModalService,
              private router: Router,
              private Service: CubeService,
              private ShareingService: DataSharedVarServiceService ) {}

  ngOnInit() {
    const Category_Id = this.ShareingService.GetCategory_Id()['Category_Id'];
    this.Category_Name = this.ShareingService.GetCategory_Id()['Category_Name'];
    this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
    if (Category_Id !== '') {
      this.Service.Cubes_List(Category_Id, this.LoginUser._id).subscribe( datas => {
        if (datas['Status'] === 'True') {
          this.Cubes_List = datas['Response'];
        } else {
          this.router.navigate(['Categories']);
        }
      });
    } else {
      this.router.navigate(['Categories']);
    }

  }

  openConfirmDialog() {
    const initialState = { title: 'Modal with component' };
      this.modalRef = this.modalService.show(CreateCubeComponent, {initialState});
      this.modalRef.content.onClose.subscribe(result => {
          this.router.navigate(['Cube_Posts']);
      });
  }

  logDate() {
    console.log(this.lists);
  }

}
