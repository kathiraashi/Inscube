import { Component, OnInit, TemplateRef  } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { NgxCarousel } from 'ngx-carousel';
import { Lightbox } from 'angular2-lightbox';
import { Router, ActivatedRoute } from '@angular/router';

import { TrendsEmoteAddComponent } from './../../trends-modal-components/trends-emote-add/trends-emote-add.component';
import { ReportTrendsComponent } from './../../trends-modal-components/report-trends/report-trends.component';
import { EditTrendsCommentComponent } from './../../trends-modal-components/edit-trends-comment/edit-trends-comment.component';
import { ReportTrendsCommentComponent } from './../../trends-modal-components/report-trends-comment/report-trends-comment.component';
import { TrendsShareCubesListComponent } from './../../trends-modal-components/trends-share-cubes-list/trends-share-cubes-list.component';
import { EditTrendsComponent } from './../../trends-modal-components/edit-trends/edit-trends.component';

import { ReportUserComponent } from './../../Modal_Components/report-user/report-user.component';
import { DeleteConfirmationComponent } from './../../Modal_Components/delete-confirmation/delete-confirmation.component';
import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';

import { PostService } from './../../service/post/post.service';

import { TrendsService } from './../../service/trends/trends.service';

@Component({
  selector: 'app-cubes-view-center-trends',
  templateUrl: './cubes-view-center-trends.component.html',
  styleUrls: ['./cubes-view-center-trends.component.css']
})
export class CubesViewCenterTrendsComponent implements OnInit {

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
  Trends_List: any[] = [];
  Capture_List: any[] = [];
  Posts_List: any[] = [];
  message;
  video_Url;
  Loader_1: Boolean = true;
  Loader_2: Boolean = false;
  Loader_3: Boolean = false;
  Show_Load_More: Boolean = true;

  Tag_Filter: Boolean = false;

  Tag_Filter_Tag;

  view_all_comment: Boolean = false;
  view_less_comment: Boolean = false;

  Trigger_PostInfo;
  Trigger_CommentInfo;
  Trigger_UserId;
  Cube_Id;
  Tag_Skip_Count = 0;

  constructor(public snackBar: MatSnackBar,
              private modalService: BsModalService,
              public Trends_Service: TrendsService,
              public Post_Service: PostService,
              public _componentConnectService: PostSubmitService,
              private router: Router,
              private _lightbox: Lightbox,
              private active_route: ActivatedRoute,
              ) {
              this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
              this.active_route.url.subscribe((u) => {
              this.Cube_Id = this.active_route.snapshot.params['Cube_Id'];
              this.Trends_Service.Cube_Based_Trends_List(this.Cube_Id, this.LoginUser._id).subscribe( datas => {
                 this.Loader_1 = false;
                    if (datas['Status'] === 'True') {
                       this.Trends_List = datas['Response'];
                       this.Trends_List.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = 5; } );
                       this.Trends_List.map(v => { v.Emotes.map(x => { x.User_Ids.map(y => {
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
     const initialState = { data: {Emotes: this.Trends_List[_Index].Emotes, Post_Info:  this.Trends_List[_Index] } };
        this.modalRef = this.modalService.show(TrendsEmoteAddComponent, Object.assign({initialState}, { class: 'maxWidth400' }));
        this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Success_New') {
           result.Response.Already = true;
           this.Trends_List[_Index].Emotes.splice(0, 0, result.Response);
           this.Trends_List.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = v.Splice_Count; } );
        } else if (result.Status === 'Success_Update') {
           const _index =  this.Trends_List[_Index].Emotes.findIndex(x => x._id === result.Response._id);
           result.Response.Already = true;
           this.Trends_List[_Index].Emotes[_index] = result.Response;
        }
        });
  }

  View_More_Emote(_index) {
     this.Trends_List[_index].Splice_Count = this.Trends_List[_index].Splice_Count + 5;
  }

  View_Less_Emote(_index) {
     this.Trends_List[_index].Splice_Count = 5;
  }

  Emote_Submit(_Index, Emote_Index) {
     const data = {
                    User_Id: this.LoginUser._id,
                    Trends_Id: this.Trends_List[_Index]._id,
                    Emote_Id: this.Trends_List[_Index].Emotes[Emote_Index]._id
                    };
     this.Trends_Service.Trends_Emote_Update(data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
           this.Trends_List[_Index].Emotes[Emote_Index].Already = true;
           this.Trends_List[_Index].Emotes[Emote_Index].Count += 1;
        }
     });
  }

  Active_CommentChange(Post_Index) {
     this.view_less_comment = false;
     if (this.ActiveComment !== Post_Index) {
        this.Loader_2 = true;
        this.ActiveComment = Post_Index;
        this.Trends_Service.Trends_Comment_List(this.Trends_List[Post_Index]._id).subscribe( datas => {
        this.Loader_2 = false;
           if (datas['Status'] === 'True' && datas['Output'] === 'True') {
              this.Trends_List[Post_Index].Comments = datas['Response'];
              if (datas['Response'].length > 2) {
              this.view_all_comment = true;
              } else {
              this.view_all_comment = false;
              this.view_less_comment = false;
              }
              this.Trends_List[Post_Index].Comments = this.Trends_List[Post_Index].Comments.slice(0, 2);
           }
        });
     } else {
        this.ActiveComment = -1;
     }
  }

  View_All_Comments() {
     this.Trends_Service.Trends_Comment_List(this.Trends_List[this.ActiveComment]._id).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
           this.Trends_List[this.ActiveComment].Comments = datas['Response'];
           this.view_less_comment = true;
           this.view_all_comment = false;
        }
     });
  }

  View_Less_Comments() {
     this.Trends_Service.Trends_Comment_List(this.Trends_List[this.ActiveComment]._id).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
           this.Trends_List[this.ActiveComment].Comments = datas['Response'];
           this.Trends_List[this.ActiveComment].Comments = this.Trends_List[this.ActiveComment].Comments.slice(0, 2);
           this.view_less_comment = false;
           this.view_all_comment = true;
        }
     });
  }

  SubmitComment(Comment_Text, Post_Index) {
     if (Comment_Text !== '') {
        const data = {'User_Id': this.LoginUser._id,
                 'Trends_Id': this.Trends_List[Post_Index]._id,
                 'Comment_Text': Comment_Text,
              };
        this.Trends_Service.Trends_Comment_Submit(data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
           this.Trends_List[Post_Index].Comments.push(datas['Response']);
        }
        });
     }
  }

  Trigger_Post(index) {
     this.Trigger_PostInfo = this.Trends_List[index];
     this.Trigger_UserId = this.Trigger_PostInfo.User_Id;
  }

  Trigger_Comment(index) {
     this.Trigger_CommentInfo = this.Trends_List[this.ActiveComment].Comments[index];
     this.Trigger_UserId = this.Trigger_CommentInfo.User_Id;
  }

  EditPost_Model() {
     const initialState = { data: { Post_Info : this.Trigger_PostInfo} };
       this.modalRef = this.modalService.show(EditTrendsComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
       this.modalRef.content.onClose.subscribe(result => {
          if (result.Status) {
           const _index =  this.Trends_List.findIndex(x => x._id === result.Response._id);
           this.Trends_List[_index].Trends_Tags = result.Response.Trends_Tags;
           this.Trends_List[_index].Trends_Text = result.Response.Trends_Text;
           this.Trends_List[_index].Cubes_Id = result.Response.Cubes_Id;
           this.Trends_List[_index].Cubes_Info = result.Response.Cubes_Info;
           this.Trends_List[_index].updatedAt = result.Response.updatedAt;
          }
       });
   }

  Delete_Post() {
     const initialState = { data: { Text : 'Are you sure! ', Text_1 : 'Deleting will permanently remove it from inscube'} };
     this.modalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth350' }));
     this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Yes') {
        this.Trends_Service.Cube_Trends_Delete(this.Trigger_PostInfo._id).subscribe( datas => {
           if (datas['Status'] === 'True' && datas['Output'] === 'True') {
              const _index =  this.Trends_List.findIndex(x => x._id === this.Trigger_PostInfo._id);
              this.Trends_List.splice(_index, 1);
           }
        });
        }
     });
  }

  Report_Post() {
     const check_Data = { User_Id: this.LoginUser._id, Trends_Id: this.Trigger_PostInfo._id };
     this.Trends_Service.Report_Trends_Check(check_Data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Available'] === 'True') {
           const initialState = {
              data: { Title : 'Report The Post ', Values : { User_Id: this.LoginUser._id, Trends_Id: this.Trigger_PostInfo._id } } };
           this.modalRef = this.modalService.show(ReportTrendsComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
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
        this.modalRef = this.modalService.show(EditTrendsCommentComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
        this.modalRef.content.onClose.subscribe(result => {
        if (result.Status) {
           const _index =  this.Trends_List[this.ActiveComment].Comments.findIndex(x => x._id === result.Response._id);
           this.Trends_List[this.ActiveComment].Comments[_index] = result.Response;
        }
        });
  }

  Delete_Comment() {
     const initialState = { data: { Text : 'Are you sure! ', Text_1 : 'Deleting will permanently remove it from inscube'} };
     this.modalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth350' }));
     this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Yes') {
        this.Trends_Service.Trends_Comment_Delete(this.Trigger_CommentInfo._id).subscribe( datas => {
           if (datas['Status'] === 'True' && datas['Output'] === 'True') {
              const _index =  this.Trends_List[this.ActiveComment].Comments.findIndex(x => x._id === this.Trigger_CommentInfo._id);
              this.Trends_List[this.ActiveComment].Comments.splice(_index, 1);
           }
        });
        }
     });
  }

  Report_Comment() {
     const check_Data = { User_Id: this.LoginUser._id, Comment_Id: this.Trigger_CommentInfo._id };
     this.Trends_Service.Report_TrendsComment_Check(check_Data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Available'] === 'True') {
           const initialState = {
              data: { Title : 'Report The Comment ', Values : { User_Id: this.LoginUser._id, Comment_Id: this.Trigger_CommentInfo._id } } };
           this.modalRef = this.modalService.show(ReportTrendsCommentComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
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
     this.modalRef = this.modalService.show(TrendsShareCubesListComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
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


  Tag_Filer_Change(_index) {
    this.Trends_List = [];
    this.Loader_1 = true;
    this.Tag_Filter = true;
    this.screenHeight = window.innerHeight - 160;
    this.scrollHeight = this.screenHeight + 'px';
    this.Tag_Filter_Tag = this.Trigger_PostInfo.Trends_Tags[_index];
    const data = { Cube_Id : this.Cube_Id, Trends_Tag : this.Tag_Filter_Tag };
    this.Trends_Service.CubeBased_Trends_Filter(data).subscribe( datas => {
       this.Loader_1 = false;
          if (datas['Status'] === 'True') {
             this.Trends_List = datas['Response'];
             this.Trends_List.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = 5; } );
             this.Trends_List.map(v => { v.Emotes.map(x => { x.User_Ids.map(y => {
                if (this.LoginUser._id === y ) {
                   x.Already = true;
                } else {
                   x.Already = false;
                }
             }); }); } );
          }
    });
 }


 reload_Trends() {
  this.screenHeight = window.innerHeight - 125;
  this.scrollHeight = this.screenHeight + 'px';
  this.Tag_Filter = false;
  this.Trends_List = [];
  this.Loader_1 = true;
  this.Trends_Service.Cube_Based_Trends_List(this.Cube_Id, this.LoginUser._id).subscribe( datas => {
     this.Loader_1 = false;
     if (datas['Status'] === 'True') {
           this.Trends_List = datas['Response'];
           this.Trends_List.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = 5; } );
           this.Trends_List.map(v => { v.Emotes.map(x => { x.User_Ids.map(y => {
              if (this.LoginUser._id === y ) {
                 x.Already = true;
              } else {
                 x.Already = false;
              }
           }); }); } );
     }
  });
}


}
