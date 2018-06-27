import { Component, OnInit, TemplateRef  } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { NgxCarousel } from 'ngx-carousel';
import { Lightbox } from 'angular2-lightbox';
import { Router, ActivatedRoute } from '@angular/router';

import { CaptureEmoteAddComponent } from './../../Capture_Modal_Components/capture-emote-add/capture-emote-add.component';
import { ReportCaptureComponent } from './../../Capture_Modal_Components/report-capture/report-capture.component';
import { EditCaptureCommentComponent } from './../../Capture_Modal_Components/edit-capture-comment/edit-capture-comment.component';
import { ReportCaptureCommentComponent } from './../../Capture_Modal_Components/report-capture-comment/report-capture-comment.component';

import { ReportUserComponent } from './../../Modal_Components/report-user/report-user.component';
import { DeleteConfirmationComponent } from './../../Modal_Components/delete-confirmation/delete-confirmation.component';
import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';
import { CaptureShareCubesListComponent } from './../../Capture_Modal_Components/capture-share-cubes-list/capture-share-cubes-list.component';

import { PostService } from './../../service/post/post.service';
import { CaptureService } from './../../service/capture/capture.service';

@Component({
  selector: 'app-profile-captures',
  templateUrl: './profile-captures.component.html',
  styleUrls: ['./profile-captures.component.css']
})
export class ProfileCapturesComponent implements OnInit {


  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';
  CapturesBaseUrl = 'http://localhost:3000/API/Uploads/Capture_Attachments/';

  modalRef: BsModalRef;
  carouselBanner: NgxCarousel;
  carouselTile: NgxCarousel;

  scrollHeight;
  screenHeight: number;

  ActiveComment;

  LoginUser;
  Capture_List: any[] = [];
  Posts_List: any[] = [];
  message;
  video_Url;
  Loader_1: Boolean = true;
  Loader_2: Boolean = false;
  Loader_3: Boolean = false;
  Show_Load_More: Boolean = true;

  view_all_comment: Boolean = false;
  view_less_comment: Boolean = false;

  Trigger_PostInfo;
  Trigger_CommentInfo;
  Trigger_UserId;
  User_Id;

  constructor(public snackBar: MatSnackBar,
              private modalService: BsModalService,
              public Capture_Service: CaptureService,
              public Post_Service: PostService,
              public _componentConnectService: PostSubmitService,
              private router: Router,
              private _lightbox: Lightbox,
              private active_route: ActivatedRoute,
              ) {
              this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
              this.active_route.url.subscribe((u) => {
              this.User_Id = this.active_route.snapshot.params['User_Id'];
              this.Capture_Service.User_Captures(this.User_Id).subscribe( datas => {
                 this.Loader_1 = false;
                    if (datas['Status'] === 'True') {
                       this.Capture_List = datas['Response'];
                       this.Capture_List.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = 5; } );
                       this.Capture_List.map(v => { v.Emotes.map(x => { x.User_Ids.map(y => {
                          if (this.LoginUser._id === y ) {
                             x.Already = true;
                          } else {
                             x.Already = false;
                          }
                       }); }); } );
                    }
                  });
                });
     }

  ngOnInit() {
     this.screenHeight = window.innerHeight - 125;
     this.scrollHeight = this.screenHeight + 'px';

     this.carouselBanner = {
        grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
        slide: 4,
        speed: 500,
        interval: 5000,
        point: {
        visible: false,
        pointStyles: `.ngxcarouselPoint `
        },
        load: 2,
        custom: 'banner',
        touch: true,
        loop: false,
        easing: 'cubic-bezier(0, 0, 0.2, 1)'
     };

     this.carouselTile = {
        grid: { xs: 6, sm: 6, md: 7, lg: 8, all: 0 },
        speed: 600,
        interval: 3000,
        point: {
        visible: false,
        },
        load: 2,
        touch: true
     };
  }

  public myfunc(event: Event) {
     // console.log(event);
  }

  Show_Image(URL) {
     const _album: Array<any> = [{ src: URL}];
     this._lightbox.open(_album, 0);
  }

  Show_Video(template: TemplateRef<any>, URL) {
     this.modalRef = this.modalService.show(template,  Object.assign({}, { class: 'modal-md' }));
     this.video_Url = URL;
  }

  Emote_Add(_Index) {
     const initialState = { data: {Emotes: this.Capture_List[_Index].Emotes, Post_Info:  this.Capture_List[_Index] } };
        this.modalRef = this.modalService.show(CaptureEmoteAddComponent, Object.assign({initialState}, { class: 'maxWidth400' }));
        this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Success_New') {
           result.Response.Already = true;
           this.Capture_List[_Index].Emotes.splice(0, 0, result.Response);
           this.Capture_List.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = v.Splice_Count; } );
        } else if (result.Status === 'Success_Update') {
           const _index =  this.Capture_List[_Index].Emotes.findIndex(x => x._id === result.Response._id);
           result.Response.Already = true;
           this.Capture_List[_Index].Emotes[_index] = result.Response;
        }
        });
  }
  View_More_Emote(_index) {
     this.Capture_List[_index].Splice_Count = this.Capture_List[_index].Splice_Count + 5;
  }
  View_Less_Emote(_index) {
     this.Capture_List[_index].Splice_Count = 5;
  }
  Emote_Submit(_Index, Emote_Index) {
     const data = {
                    User_Id: this.LoginUser._id,
                    Capture_Id: this.Capture_List[_Index]._id,
                    Emote_Id: this.Capture_List[_Index].Emotes[Emote_Index]._id
                    };
     this.Capture_Service.Capture_Emote_Update(data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
           this.Capture_List[_Index].Emotes[Emote_Index].Already = true;
           this.Capture_List[_Index].Emotes[Emote_Index].Count += 1;
        }
     });
  }



  Active_CommentChange(Post_Index) {
     this.view_less_comment = false;
     if (this.ActiveComment !== Post_Index) {
        this.Loader_2 = true;
        this.ActiveComment = Post_Index;
        this.Capture_Service.Capture_Comment_List(this.Capture_List[Post_Index]._id).subscribe( datas => {
        this.Loader_2 = false;
           if (datas['Status'] === 'True' && datas['Output'] === 'True') {
              this.Capture_List[Post_Index].Comments = datas['Response'];
              if (datas['Response'].length > 2) {
              this.view_all_comment = true;
              } else {
              this.view_all_comment = false;
              this.view_less_comment = false;
              }
              this.Capture_List[Post_Index].Comments = this.Capture_List[Post_Index].Comments.slice(0, 2);
           }
        });
     } else {
        this.ActiveComment = -1;
     }
  }

  View_All_Comments() {
     this.Capture_Service.Capture_Comment_List(this.Capture_List[this.ActiveComment]._id).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
           this.Capture_List[this.ActiveComment].Comments = datas['Response'];
           this.view_less_comment = true;
           this.view_all_comment = false;
        }
     });
  }

  View_Less_Comments() {
     this.Capture_Service.Capture_Comment_List(this.Capture_List[this.ActiveComment]._id).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
           this.Capture_List[this.ActiveComment].Comments = datas['Response'];
           this.Capture_List[this.ActiveComment].Comments = this.Capture_List[this.ActiveComment].Comments.slice(0, 2);
           this.view_less_comment = false;
           this.view_all_comment = true;
        }
     });
  }

  SubmitComment(Comment_Text, Post_Index) {
     if (Comment_Text !== '') {
        const data = {'User_Id': this.LoginUser._id,
                 'Capture_Id': this.Capture_List[Post_Index]._id,
                 'Comment_Text': Comment_Text,
              };
        this.Capture_Service.Capture_Comment_Submit(data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
           this.Capture_List[Post_Index].Comments.push(datas['Response']);
        }
        });
     }
  }



  Trigger_Post(index) {
     this.Trigger_PostInfo = this.Capture_List[index];
     this.Trigger_UserId = this.Trigger_PostInfo.User_Id;
  }

  Trigger_Comment(index) {
     this.Trigger_CommentInfo = this.Capture_List[this.ActiveComment].Comments[index];
     this.Trigger_UserId = this.Trigger_CommentInfo.User_Id;
  }


  Delete_Post() {
     const initialState = { data: { Text : 'Are you sure! ', Text_1 : 'Deleting will permanently remove it from inscube'} };
     this.modalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth350' }));
     this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Yes') {
        this.Capture_Service.Cube_Capture_Delete(this.Trigger_PostInfo._id).subscribe( datas => {
           if (datas['Status'] === 'True' && datas['Output'] === 'True') {
              const _index =  this.Capture_List.findIndex(x => x._id === this.Trigger_PostInfo._id);
              this.Capture_List.splice(_index, 1);
           }
        });
        }
     });
  }


  Report_Post() {
     const check_Data = { User_Id: this.LoginUser._id, Capture_Id: this.Trigger_PostInfo._id };
     this.Capture_Service.Report_Capture_Check(check_Data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Available'] === 'True') {
           const initialState = {
              data: { Title : 'Report The Post ', Values : { User_Id: this.LoginUser._id, Capture_Id: this.Trigger_PostInfo._id } } };
           this.modalRef = this.modalService.show(ReportCaptureComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
           this.modalRef.content.onClose.subscribe(result => {
              this.snackBar.open( 'You report accepted!!', ' ', {
                 horizontalPosition: 'center',
                 duration: 3000,
                 verticalPosition: 'top',
              });
           });
        } else {
           this.snackBar.open( 'You already report this post!!', ' ', {
                 horizontalPosition: 'center',
                 duration: 3000,
                 verticalPosition: 'top',
           });
        }
     });
  }


  Report_User() {
     const check_Data = { User_Id: this.LoginUser._id, To_User_Id: this.Trigger_UserId };
     this.Post_Service.Report_User_Check(check_Data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Available'] === 'True') {
           const initialState = {
              data: { Title : 'Report The User ', Values : { User_Id: this.LoginUser._id, To_User_Id: this.Trigger_UserId } } };
           this.modalRef = this.modalService.show(ReportUserComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
           this.modalRef.content.onClose.subscribe(result => {
              this.snackBar.open( 'You report accepted!!', ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
              });
           });
        } else {
        this.snackBar.open( 'You already report this user!!', ' ', {
           horizontalPosition: 'center',
           duration: 3000,
           verticalPosition: 'top',
        });
        }
     });
  }

  EditComment_Model() {
     const initialState = { data: { Value : this.Trigger_CommentInfo} };
        this.modalRef = this.modalService.show(EditCaptureCommentComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
        this.modalRef.content.onClose.subscribe(result => {
        if (result.Status) {
           const _index =  this.Capture_List[this.ActiveComment].Comments.findIndex(x => x._id === result.Response._id);
           this.Capture_List[this.ActiveComment].Comments[_index] = result.Response;
        }
        });
  }

  Delete_Comment() {
     const initialState = { data: { Text : 'Are you sure! ', Text_1 : 'Deleting will permanently remove it from inscube'} };
     this.modalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth350' }));
     this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Yes') {
        this.Capture_Service.Capture_Comment_Delete(this.Trigger_CommentInfo._id).subscribe( datas => {
           if (datas['Status'] === 'True' && datas['Output'] === 'True') {
              const _index =  this.Capture_List[this.ActiveComment].Comments.findIndex(x => x._id === this.Trigger_CommentInfo._id);
              this.Capture_List[this.ActiveComment].Comments.splice(_index, 1);
           }
        });
        }
     });
  }

  Report_Comment() {
     const check_Data = { User_Id: this.LoginUser._id, Comment_Id: this.Trigger_CommentInfo._id };
     this.Capture_Service.Report_CaptureComment_Check(check_Data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Available'] === 'True') {
           const initialState = {
              data: { Title : 'Report The Comment ', Values : { User_Id: this.LoginUser._id, Comment_Id: this.Trigger_CommentInfo._id } } };
           this.modalRef = this.modalService.show(ReportCaptureCommentComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
           this.modalRef.content.onClose.subscribe(result => {
              this.snackBar.open( 'You report accepted!!', ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
              });
           });
        } else {
        this.snackBar.open( 'You already report this comment!', ' ', {
           horizontalPosition: 'center',
           duration: 3000,
           verticalPosition: 'top',
        });
        }
     });
  }



  Share_Post() {
     const initialState = { data: { Post_Info : this.Trigger_PostInfo } };
     this.modalRef = this.modalService.show(CaptureShareCubesListComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
     this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Yes') {
           this.snackBar.open( 'Post Successfully Shared' , ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
           });
        }
     });
  }

}
