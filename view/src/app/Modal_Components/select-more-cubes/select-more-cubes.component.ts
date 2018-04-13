import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CubeService } from './../../service/cube/cube.service';

@Component({
  selector: 'app-select-more-cubes',
  templateUrl: './select-more-cubes.component.html',
  styleUrls: ['./select-more-cubes.component.css']
})
export class SelectMoreCubesComponent implements OnInit {

  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';

  LoginUser;

  data;
  onClose: Subject<Object>;

  Cubes_List: any[] = [];
  Selected_Cube: any[] = [];

  constructor(
              public _bsModalRef: BsModalRef,
              public snackBar: MatSnackBar,
              public Cube_Service: CubeService,
      ) {
        this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
        this.Cube_Service.User_Followed_Cubes(this.LoginUser._id).subscribe( datas => {
          if (datas['Status'] === 'True') {
              this.Cubes_List = datas['Response'];
              this.Cubes_List.map(v => v.Selected = false);
          }
      });
   }

  ngOnInit() {
    this.onClose = new Subject();
  }

  Select_Cube(index) {
    if ( this.Cubes_List[index].Selected ) {
        this.Cubes_List[index].Selected = false;
        const _index = this.Selected_Cube.findIndex(x => x === this.Cubes_List[index]._id);
        this.Selected_Cube.splice(_index, 1);
    } else {
        this.Cubes_List[index].Selected = true;
        this.Selected_Cube.push(this.Cubes_List[index]._id);
    }
  }
  Add(){
    this.onClose.next({More_Selected_List: this.Selected_Cube });
    this._bsModalRef.hide();
  }

}
