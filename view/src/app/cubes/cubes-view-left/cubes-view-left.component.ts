import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { MatSnackBar } from '@angular/material';


import { JoinConfirmationComponent } from './../../Modal_Components/join-confirmation/join-confirmation.component';
import { EditCubeComponent } from './../../Modal_Components/edit-cube/edit-cube.component';
import { AddEmailInviteComponent } from './../../Modal_Components/add-email-invite/add-email-invite.component';
import { DataSharedVarServiceService } from './../../service/data-shared-var-service/data-shared-var-service.service';
import { DeleteConfirmationComponent } from './../../Modal_Components/delete-confirmation/delete-confirmation.component';

import { AddTopicComponent } from './../../Modal_Components/add-topic/add-topic.component';
import { CubeViewRelatedService } from './../../component-connecting/cube-view-related/cube-view-related.service';
import { CubeService } from './../../service/cube/cube.service';
import { NgModuleCompileResult } from '@angular/compiler/src/ng_module_compiler';

import { ViewAllCubesComponent } from './../../Modal_Components/view-all-cubes/view-all-cubes.component';

@Component({
  selector: 'app-cubes-view-left',
  templateUrl: './cubes-view-left.component.html',
  styleUrls: ['./cubes-view-left.component.css']
})
export class CubesViewLeftComponent implements OnInit {


  modalRef: BsModalRef;

  CategoryBaseUrl = 'http://localhost:4000/API/Uploads/Category/';
  UsersBaseUrl = 'http://localhost:4000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:4000/API/Uploads/Cubes/';

  LoginUser;
  Members_List: any[] = [];
  Cube_Id;
  Cube_Info;
  View_Source = 'Posts';

  If_Invite;

  constructor(private active_route: ActivatedRoute,
              private modalService: BsModalService,
              public snackBar: MatSnackBar,
              private router: Router,
              private Cube_Service: CubeService,
              private Cube_View_Source: CubeViewRelatedService,
              private ShareingService: DataSharedVarServiceService,
            ) {
        this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));

        this.If_Invite = this.ShareingService.GetInviteRoute();

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

                    if (this.If_Invite.CubeId !== '' && this.Cube_Info.Security === 'Close') {
                        this.JoinCodeGet();
                        this.If_Invite = this.ShareingService.SetInviteRoute('');
                      }
                    if (this.If_Invite.CubeId !== '' && this.Cube_Info.Security === 'Open') {
                        this.DirectJoin();
                        this.If_Invite = this.ShareingService.SetInviteRoute('');
                      }
                }
                this.ShareingService.SetInviteRoute('');

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
                            this.Cube_View_Source.Cube_View_Source('Topics');
                            this.View_Source = 'Topics';
                        } else {
                            this.Cube_Info.Followed = true;
                            this.Cube_View_Source.Cube_View_Source('Posts');
                            this.View_Source = 'Posts';
                        }
                    }
                });
            });
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
            this.View_Source = 'Posts';
            this.Cube_View_Source.Cube_View_Source('Posts');
            const _index =  this.Members_List.findIndex(x => x._id === this.LoginUser._id);
            this.Members_List.splice(_index, 1);
        }
    });
  }

  View_All_Members() {
    const initialState = {data : { Type: 3, Title : 'Members', Cube_Id : this.Cube_Info._id } };
    this.modalRef = this.modalService.show( ViewAllCubesComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
    this.modalRef.content.onClose.subscribe(result => {
       console.log(result);
    });
  }


  JoinCodeGet() {
    const initialState = { data: { Cube_Info:  this.Cube_Info } };
      this.modalRef = this.modalService.show(JoinConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth400' }));
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

  link_Copy() {
    this.snackBar.open( 'Invite link copy to clipboard' , ' ', {
        horizontalPosition: 'center',
        duration: 3000,
        verticalPosition: 'top',
    });
  }

  Edit_Cube() {
    const initialState = { data: { Cube_Info:  this.Cube_Info } };
    this.modalRef = this.modalService.show(EditCubeComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status === 'Success') {
          this.Cube_Info = result.Response;
          this.Cube_Info.Creator = true;
      }
    });
  }

  Invite_Email() {
    const initialState = { data: { Cube_Info:  this.Cube_Info } };
    this.modalRef = this.modalService.show(AddEmailInviteComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status === 'Success') {
          this.Cube_Info = result.Response;
          this.Cube_Info.Creator = true;
      }
    });
  }

  Dlete_Cube() {
    const initialState = { data: { Text : 'Are you sure! ', Text_1 : 'Deleting will permanently remove it from inscube'} };
    this.modalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth350' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status === 'Yes') {
        const data = { User_Id : this.LoginUser._id,  Cube_Id: this.Cube_Id };
        this.Cube_Service.Delete_Cube(data).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            this.router.navigate(['/Cube_Posts']);
          }
        });
      }
    });
  }

}
