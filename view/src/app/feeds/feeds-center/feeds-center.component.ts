import { Component, OnInit, TemplateRef  } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { NgxCarousel } from 'ngx-carousel';
import { Lightbox } from 'angular2-lightbox';

import { EmoteAddComponent } from './../../Modal_Components/emote-add/emote-add.component';
import { EditPostComponent } from './../../Modal_Components/edit-post/edit-post.component';
import { ReportPostComponent } from './../../Modal_Components/report-post/report-post.component';
import { ReportUserComponent } from './../../Modal_Components/report-user/report-user.component';
import { EditCommentComponent } from './../../Modal_Components/edit-comment/edit-comment.component';
import { ReportCommentComponent } from './../../Modal_Components/report-comment/report-comment.component';
import { DeleteConfirmationComponent } from './../../Modal_Components/delete-confirmation/delete-confirmation.component';
import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';
import { PostShareCubesListComponent } from './../../Modal_Components/post-share-cubes-list/post-share-cubes-list.component';

import { PostService } from './../../service/post/post.service';


@Component({
  selector: 'app-feeds-center',
  templateUrl: './feeds-center.component.html',
  styleUrls: ['./feeds-center.component.css']
})
export class FeedsCenterComponent implements OnInit {

  UsersBaseUrl = 'http://localhost:4000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:4000/API/Uploads/Cubes/';
  PostsBaseUrl = 'http://localhost:4000/API/Uploads/Post_Attachments/';

  modalRef: BsModalRef;
  carouselBanner: NgxCarousel;
  carouselTile: NgxCarousel;

  scrollHeight;
  screenHeight: number;

  ActiveComment;

  LoginUser;
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
  Skip_Count = 0;

  constructor(public snackBar: MatSnackBar,
              private modalService: BsModalService,
              public Post_Service: PostService,
              public _componentConnectService: PostSubmitService,
              private _lightbox: Lightbox
            ) {
              this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
              this.Post_Service.Cube_Post_List(this.LoginUser._id, 0).subscribe( datas => {
                this.Loader_1 = false;
                this.Skip_Count =  15;
                  if (datas['Status'] === 'True') {
                      this.Posts_List = datas['Response'];
                      this.Posts_List.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = 5; } );
                      this.Posts_List.map(v => { v.Emotes.map(x => { x.User_Ids.map(y => {
                          if (this.LoginUser._id === y ) {
                            x.Already = true;
                          } else {
                            x.Already = false;
                          }
                       }); }); } );
                       if ( this.Posts_List.length < 15) {
                        this.Show_Load_More = false;
                      }
                  }
              });

              this._componentConnectService.New_Post_Added.subscribe(message => { // New Post Submit Response
                if (message !== '' ) {
                  this.Skip_Count = this.Skip_Count + 1;
                  this.Posts_List.splice(0 , 0, message);
                  this.Posts_List.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = 5; } );
                }
              });

              this._componentConnectService.Reload_Feeds.subscribe(message => {
                this.Posts_List = [];
                this.Loader_1 = true;
                this.Show_Load_More = true;
                this.Post_Service.Cube_Post_List(this.LoginUser._id, 0).subscribe( datas => {
                  this.Loader_1 = false;
                  this.Skip_Count = 15;
                    if (datas['Status'] === 'True') {
                        this.Posts_List = datas['Response'];
                        this.Posts_List.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = 5; } );
                        this.Posts_List.map(v => { v.Emotes.map(x => { x.User_Ids.map(y => {
                            if (this.LoginUser._id === y ) {
                              x.Already = true;
                            } else {
                              x.Already = false;
                            }
                         }); }); } );
                        if ( this.Posts_List.length < 15) {
                          this.Show_Load_More = false;
                        }
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

  Emote_Add(Post_Index) {
    const initialState = { data: {Emotes: this.Posts_List[Post_Index].Emotes, Post_Info:  this.Posts_List[Post_Index] } };
      this.modalRef = this.modalService.show(EmoteAddComponent, Object.assign({initialState}, { class: 'maxWidth400' }));
      this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Success_New') {
          result.Responce.Already = true;
          this.Posts_List[Post_Index].Emotes.splice(0, 0, result.Responce);
          this.Posts_List.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = v.Splice_Count; } );
        } else if (result.Status === 'Success_Update') {
          const _index =  this.Posts_List[Post_Index].Emotes.findIndex(x => x._id === result.Responce._id);
          result.Responce.Already = true;
          this.Posts_List[Post_Index].Emotes[_index] = result.Responce;
        }
      });
  }
  View_More_Emote(_index) {
    this.Posts_List[_index].Splice_Count = this.Posts_List[_index].Splice_Count + 5;
  }
  View_Less_Emote(_index) {
    this.Posts_List[_index].Splice_Count = 5;
  }
  Emote_Submit(Post_Index, Emote_Index) {
    const data = {
                    User_Id: this.LoginUser._id,
                    Post_Id: this.Posts_List[Post_Index]._id,
                    Emote_Id: this.Posts_List[Post_Index].Emotes[Emote_Index]._id
                  };
    this.Post_Service.Emote_Update(data).subscribe( datas => {
      if (datas['Status'] === 'True' && datas['Output'] === 'True') {
          this.Posts_List[Post_Index].Emotes[Emote_Index].Already = true;
          this.Posts_List[Post_Index].Emotes[Emote_Index].Count += 1;
      }
    });
  }



  Active_CommentChange(Post_Index) {
    this.view_less_comment = false;
    if (this.ActiveComment !== Post_Index) {
      this.Loader_2 = true;
      this.ActiveComment = Post_Index;
      this.Post_Service.Comment_List(this.Posts_List[Post_Index]._id).subscribe( datas => {
        this.Loader_2 = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            this.Posts_List[Post_Index].Comments = datas['Response'];
            if (datas['Response'].length > 2) {
              this.view_all_comment = true;
            } else {
              this.view_all_comment = false;
              this.view_less_comment = false;
            }
            this.Posts_List[Post_Index].Comments = this.Posts_List[Post_Index].Comments.slice(0, 2);
          }
      });
    } else {
      this.ActiveComment = -1;
    }
  }

  View_All_Comments() {
    this.Post_Service.Comment_List(this.Posts_List[this.ActiveComment]._id).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
          this.Posts_List[this.ActiveComment].Comments = datas['Response'];
          this.view_less_comment = true;
          this.view_all_comment = false;
        }
    });
  }

  View_Less_Comments() {
    this.Post_Service.Comment_List(this.Posts_List[this.ActiveComment]._id).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
          this.Posts_List[this.ActiveComment].Comments = datas['Response'];
          this.Posts_List[this.ActiveComment].Comments = this.Posts_List[this.ActiveComment].Comments.slice(0, 2);
          this.view_less_comment = false;
          this.view_all_comment = true;
        }
    });
  }

  SubmitComment(Comment_Text, Post_Index) {
    if (Comment_Text !== '') {
      const data = {'User_Id': this.LoginUser._id,
                'Post_Id': this.Posts_List[Post_Index]._id,
                'Comment_Text': Comment_Text,
              };
      this.Post_Service.Comment_Submit(data).subscribe( datas => {
        if (datas['Status'] === 'True' && datas['Output'] === 'True') {
          this.Posts_List[Post_Index].Comments.push(datas['Response']);
        }
      });
    }
  }



  Trigger_Post(index) {
    this.Trigger_PostInfo = this.Posts_List[index];
    this.Trigger_UserId = this.Trigger_PostInfo.User_Id;
  }

  Trigger_Comment(index) {
    this.Trigger_CommentInfo = this.Posts_List[this.ActiveComment].Comments[index];
    this.Trigger_UserId = this.Trigger_CommentInfo.User_Id;
  }

  EditPost_Model() {
    const initialState = { data: { Post_Info : this.Trigger_PostInfo} };
      this.modalRef = this.modalService.show(EditPostComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
      this.modalRef.content.onClose.subscribe(result => {
         if (result.Status) {
          const _index =  this.Posts_List.findIndex(x => x._id === result.Response._id);
          this.Posts_List[_index].Post_Category = result.Response.Post_Category;
          this.Posts_List[_index].Post_Text = result.Response.Post_Text;
          this.Posts_List[_index].Cubes_Id = result.Response.Cubes_Id;
          this.Posts_List[_index].Cubes_Info = result.Response.Cubes_Info;
          this.Posts_List[_index].Post_Link = result.Response.Post_Link;
          this.Posts_List[_index].Post_Link_Info = {};
          this.Posts_List[_index].Post_Link_Info = result.Response.Post_Link_Info;
          this.Posts_List[_index].Attachments = result.Response.Attachments;
          this.Posts_List[_index].Attach_File = result.Response.Attach_File;
          this.Posts_List[_index].updatedAt = result.Response.updatedAt;
         }
      });
  }

  Delete_Post() {
    const initialState = { data: { Text : 'Are you sure! ', Text_1 : 'Deleting will permanently remove it from inscube'} };
    this.modalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth350' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status === 'Yes') {
        this.Post_Service.Cube_Post_Delete(this.Trigger_PostInfo._id).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            this.Skip_Count = this.Skip_Count - 1;
            const _index =  this.Posts_List.findIndex(x => x._id === this.Trigger_PostInfo._id);
            this.Posts_List.splice(_index, 1);
          }
        });
      }
    });
  }


  Report_Post() {
    const check_Data = { User_Id: this.LoginUser._id, Post_Id: this.Trigger_PostInfo._id };
    this.Post_Service.Report_Post_Check(check_Data).subscribe( datas => {
      if (datas['Status'] === 'True' && datas['Available'] === 'True') {
          const initialState = {
              data: { Title : 'Report The Post ', Values : { User_Id: this.LoginUser._id, Post_Id: this.Trigger_PostInfo._id } } };
          this.modalRef = this.modalService.show(ReportPostComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
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
      this.modalRef = this.modalService.show(EditCommentComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
      this.modalRef.content.onClose.subscribe(result => {
        if (result.Status) {
          const _index =  this.Posts_List[this.ActiveComment].Comments.findIndex(x => x._id === result.Response._id);
          this.Posts_List[this.ActiveComment].Comments[_index] = result.Response;
        }
      });
  }

  Delete_Comment() {
    const initialState = { data: { Text : 'Are you sure! ', Text_1 : 'Deleting will permanently remove it from inscube'} };
    this.modalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth350' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status === 'Yes') {
        this.Post_Service.Comment_Delete(this.Trigger_CommentInfo._id).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            const _index =  this.Posts_List[this.ActiveComment].Comments.findIndex(x => x._id === this.Trigger_CommentInfo._id);
            this.Posts_List[this.ActiveComment].Comments.splice(_index, 1);
          }
        });
      }
    });
  }

  Report_Comment() {
    const check_Data = { User_Id: this.LoginUser._id, Comment_Id: this.Trigger_CommentInfo._id };
    this.Post_Service.Report_Comment_Check(check_Data).subscribe( datas => {
      if (datas['Status'] === 'True' && datas['Available'] === 'True') {
          const initialState = {
              data: { Title : 'Report The Comment ', Values : { User_Id: this.LoginUser._id, Comment_Id: this.Trigger_CommentInfo._id } } };
          this.modalRef = this.modalService.show(ReportCommentComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
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
    this.modalRef = this.modalService.show(PostShareCubesListComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
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

  Load_More_Posts() {
    this.Loader_3 = true;
    this.Post_Service.Cube_Post_List(this.LoginUser._id, this.Skip_Count).subscribe( datas => {
      this.Loader_3 = false;
      this.Skip_Count = this.Skip_Count + 15;
        if (datas['Status'] === 'True') {
          const new_Posts = datas['Response'];
          new_Posts.map(v => { v.Emote_Count = (v.Emotes).length ; v.Splice_Count = 5; } );
          new_Posts.map(v => { v.Emotes.map(x => { x.User_Ids.map(y => {
            if (this.LoginUser._id === y ) {
              x.Already = true;
            } else {
              x.Already = false;
            }
          }); }); } );
          if ( new_Posts.length < 15) {
            this.Show_Load_More = false;
          }
          this.Posts_List = this.Posts_List.concat(new_Posts);
        }
    });
  }
}
