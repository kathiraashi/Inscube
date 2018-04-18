import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';


import { JoinConfirmationComponent } from './../../Modal_Components/join-confirmation/join-confirmation.component';


import { AddTopicComponent } from './../../Modal_Components/add-topic/add-topic.component';
import { CubeViewRelatedService } from './../../component-connecting/cube-view-related/cube-view-related.service';
import { CubeService } from './../../service/cube/cube.service';
import { NgModuleCompileResult } from '@angular/compiler/src/ng_module_compiler';

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
  Members_List: any[] = [];
  Cube_Id;
  Cube_Info;
  View_Source = 'Topics';

  constructor(private active_route: ActivatedRoute,
              private modalService: BsModalService,
              private router: Router,
              private Cube_Service: CubeService,
              private Cube_View_Source: CubeViewRelatedService
            ) {
        this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));

        this.active_route.url.subscribe((u) => {
            this.Cube_Id = this.active_route.snapshot.params['Cube_Id'];
            this.Cube_Service.View_Cube(this.Cube_Id, this.LoginUser._id).subscribe( datas => {
                if (datas['Status'] === 'True') {
                    this.Cube_Info = datas['Response'];
                    if (this.Cube_Info.User_Id ===  this.LoginUser._id) {
                        this.Cube_Info.Creator = true;
                    } else {
                        this.Cube_Info.Creator = false;
                    }
                }

                this.Cube_Service.Cube_Members(this.Cube_Id).subscribe( result => {
                    if (result['Status'] === 'True') {
                        this.Members_List = result['Response'];
                        let Cube_Member = false;
                        this.Members_List.map(v => {
                            if (v._id === this.LoginUser._id) {
                                Cube_Member = true;
                            }}
                        );
                        if (!Cube_Member) {
                            this.Cube_Info.Followed = false;
                        } else {
                            this.Cube_Info.Followed = true;
                        }
                    }
                });

            });

            this.Cube_View_Source.Cube_View_Source('Topics');
            this.View_Source = 'Topics';
          });
  }


  ngOnInit( ) {
  }

  View_Source_change(Source) {
    this.View_Source = Source;
    this.Cube_View_Source.Cube_View_Source(Source);
  }

  Add_Topic_Model() {
    const initialState = { data: { Cube_Info: this.Cube_Info } };
      this.modalRef = this.modalService.show(AddTopicComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
      this.modalRef.content.onClose.subscribe(result => {
        this.View_Source = 'Topics';
        this.Cube_View_Source.Cube_View_Source('Topics');
      });
  }

  Unfollow() {
    const data = { User_Id : this.LoginUser._id,  Cube_Id: this.Cube_Id };

    this.Cube_Service.UnFollow_Cube(data).subscribe( datas => {
        if (datas['Status'] === 'True' ) {
            this.Cube_Info.Followed = false;
            this.View_Source = 'Topics';
            this.Cube_View_Source.Cube_View_Source('Topics');
            const _index =  this.Members_List.findIndex(x => x._id === this.LoginUser._id);
            this.Members_List.splice(_index, 1);
        }
    });
  }


  JoinCodeGet() {
    const initialState = { data: { Cube_Info:  this.Cube_Info } };
      this.modalRef = this.modalService.show(JoinConfirmationComponent, {initialState});
      this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Success') {
            this.Cube_Info.Followed = true;
            this.Cube_Service.Cube_Members(this.Cube_Id).subscribe( datas => {
                if (datas['Status'] === 'True') {
                    this.Members_List = datas['Response'];
                }
            });
        }
      });
  }

  DirectJoin() {
    const data = { User_Id: this.LoginUser._id, Cube_Id: this.Cube_Id };
        this.Cube_Service.Follow_Cube(data).subscribe( result => {
          if (result['Status'] === 'True' && result['Output'] === 'True') {
            this.Cube_Info.Followed = true;
            this.Cube_Service.Cube_Members(this.Cube_Id).subscribe( datas => {
                if (datas['Status'] === 'True') {
                    this.Members_List = datas['Response'];
                }
            });
          }
      });
  }

}
