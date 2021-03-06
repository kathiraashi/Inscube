import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CubeService } from './../../service/cube/cube.service';

@Component({
  selector: 'app-view-all-cubes',
  templateUrl: './view-all-cubes.component.html',
  styleUrls: ['./view-all-cubes.component.css']
})
export class ViewAllCubesComponent implements OnInit {

  onClose: Subject<any>;

  UsersBaseUrl = 'http://localhost:4000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:4000/API/Uploads/Cubes/';

  LoginUser;
  Cubes_List;
  Users_List;
  Loader_1: Boolean = true;
  data;

  constructor(  public _bsModalRef: BsModalRef,
                public Cube_Service: CubeService,
              ) {
                this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
  }

  ngOnInit(): void {
    this.onClose = new Subject();

    if (this.data.Type === 1) {
      this.Cube_Service.User_Cubes(this.data.User_Id).subscribe( datas => {
        this.Loader_1 = false;
          if (datas['Status'] === 'True') {
              this.Cubes_List = datas['Response'];
          }
      });
    } else if (this.data.Type === 2) {
      this.Cube_Service.User_Followed_Cubes(this.data.User_Id).subscribe( datas => {
        this.Loader_1 = false;
        if (datas['Status'] === 'True') {
            this.Cubes_List = datas['Response'];
        }
      });
    } else if (this.data.Type === 3) {
      this.Cube_Service.Cube_Members(this.data.Cube_Id).subscribe( datas => {
        this.Loader_1 = false;
          if (datas['Status'] === 'True') {
              this.Users_List = datas['Response'];
          }
      });
    }



  }

  Close() {
    this.onClose.next({Status: 'Success' });
    this._bsModalRef.hide();
  }

}
