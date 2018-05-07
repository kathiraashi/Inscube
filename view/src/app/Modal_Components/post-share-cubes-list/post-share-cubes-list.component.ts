import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CubeService } from './../../service/cube/cube.service';
import { PostService } from './../../service/post/post.service';

import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';

@Component({
  selector: 'app-post-share-cubes-list',
  templateUrl: './post-share-cubes-list.component.html',
  styleUrls: ['./post-share-cubes-list.component.css']
})
export class PostShareCubesListComponent implements OnInit {

  onClose: Subject<any>;

  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';

  LoginUser;
  Cubes_List;
  Loader_1: Boolean = true;
  data;
  Selected_Cube: any[] = [];

  constructor(  public _bsModalRef: BsModalRef,
                public Cube_Service: CubeService,
                public Post_Service: PostService,
                public Post_Submit_change: PostSubmitService
              ) {
                this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
  }

  ngOnInit() {
    this.onClose = new Subject();

      this.Cube_Service.User_Followed_Cubes(this.LoginUser._id).subscribe( datas => {
          this.Loader_1 = false;
          if (datas['Status'] === 'True') {
            const post_Ids = this.data.Post_Info.Cubes_Id;
              this.Cubes_List = datas['Response'].filter(item => post_Ids.indexOf(item._id) < 0);
              this.Cubes_List.map(v => v.Selected = false);
          }
      });
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

  Submit() {
    const data = {User_Id: this.LoginUser._id, Post_Id: this.data.Post_Info._id, Cubes_List: JSON.stringify(this.Selected_Cube)};
    this.Post_Service.Cube_Post_Share(data).subscribe( datas => {
      if (datas['Status'] === 'True' && datas['Output'] === 'True') {
              this.onClose.next({Status: 'Yes'});
              this._bsModalRef.hide();
      } else {
          this.onClose.next({Status: 'No' });
          this._bsModalRef.hide();
      }
    });
  }

}
