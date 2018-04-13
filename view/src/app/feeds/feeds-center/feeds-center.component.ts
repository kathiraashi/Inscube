import { Component, OnInit, ElementRef, TemplateRef  } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

import { MatSnackBar } from '@angular/material';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { EmoteAddComponent } from './../../Modal_Components/emote-add/emote-add.component';
import { EditPostComponent } from './../../Modal_Components/edit-post/edit-post.component';
import { ReportPostComponent } from './../../Modal_Components/report-post/report-post.component';
import { ReportUserComponent } from './../../Modal_Components/report-user/report-user.component';
import { EditCommentComponent } from './../../Modal_Components/edit-comment/edit-comment.component';
import { ReportCommentComponent } from './../../Modal_Components/report-comment/report-comment.component';
import { DeleteConfirmationComponent } from './../../Modal_Components/delete-confirmation/delete-confirmation.component';
import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';

import { PostService } from './../../service/post/post.service';


@Component({
  selector: 'app-feeds-center',
  templateUrl: './feeds-center.component.html',
  styleUrls: ['./feeds-center.component.css']
})
export class FeedsCenterComponent implements OnInit {

  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';
  PostsBaseUrl = 'http://localhost:3000/API/Uploads/Post_Attachments/';

  modalRef: BsModalRef;

  scrollHeight;
  screenHeight: number;

  ActiveComment;

  LoginUser;
  Posts_List: any[] = [];
  message;

  Trigger_PostInfo;
  Trigger_CommentInfo;
  Trigger_UserId;

  constructor(public snackBar: MatSnackBar,
              private modalService: BsModalService,
              public Post_Service: PostService,
              private router: Router,
              public _componentConnectService: PostSubmitService,
              private elementRef: ElementRef
            ) {
              this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
              this.Post_Service.Cube_Post_List(this.LoginUser._id).subscribe( datas => {
                  if (datas['Status'] === 'True') {
                      this.Posts_List = datas['Response'];
                  }
              });

              this._componentConnectService.currentMessage.subscribe(message => { // New Post Submit Response
                if (message !== '' ) {
                  this.Posts_List.splice(0 , 0, message);
                }
              });
     }

  ngOnInit() {
    this.screenHeight = window.innerHeight - 80;
    this.scrollHeight = this.screenHeight + 'px';
  }

  Emote_Add(Post_Index) {
    const initialState = { data: {Emotes: this.Posts_List[Post_Index].Emotes, Post_Info:  this.Posts_List[Post_Index] } };
      this.modalRef = this.modalService.show(EmoteAddComponent, {initialState});
      this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Success_New') {
          this.Posts_List[Post_Index].Emotes.splice(0, 0, result.Responce);
        } else if (result.Status === 'Success_Update') {
          const _index =  this.Posts_List[Post_Index].Emotes.findIndex(x => x._id === result.Responce._id);
          this.Posts_List[Post_Index].Emotes[_index] = result.Responce;
        } else {
          console.log(result);
        }
      });
  }

  Active_CommentChange(Post_Index) {
    if (this.ActiveComment !== Post_Index) {
      this.ActiveComment = Post_Index;
      this.Post_Service.Comment_List(this.Posts_List[Post_Index]._id).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            this.Posts_List[Post_Index].Comments = datas['Response'];
          }
      });
    } else {
      this.ActiveComment = -1;
    }

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
          this.Posts_List[_index].Attachments = result.Response.Attachments;
          this.Posts_List[_index].updatedAt = result.Response.updatedAt;
         }
      });
  }

  Delete_Post() {
    const initialState = { data: { Text : 'Are you Sure! ', Text_1 : 'You want to Delete this Post.'} };
    this.modalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'modal-sm' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status === 'Yes') {
        this.Post_Service.Cube_Post_Delete(this.Trigger_PostInfo._id).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            const _index =  this.Posts_List.findIndex(x => x._id === this.Trigger_PostInfo._id);
            this.Posts_List.splice(_index, 1);
            this.snackBar.open( 'Post Successfully Deleted!' , ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          } else {
            this.snackBar.open( 'Post Delete Failed Please Try Again!' , ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          }
        });
      } else {
        this.snackBar.open( 'Post Delete Confirmation Declined!' , ' ', {
          horizontalPosition: 'center',
          duration: 3000,
          verticalPosition: 'top',
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
            this.snackBar.open( 'You Report Accepted!!', ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          });
      } else {
        this.snackBar.open( 'You Already Report This Post!!', ' ', {
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
            this.snackBar.open( 'You Report Accepted!!', ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          });
      } else {
        this.snackBar.open( 'You Already Report This User!!', ' ', {
          horizontalPosition: 'center',
          duration: 3000,
          verticalPosition: 'top',
        });
      }
    });
  }

  EditComment_Model() {
    console.log(this.Trigger_CommentInfo);
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
    const initialState = { data: { Text : 'Are you Sure! ', Text_1 : 'You want to Delete this Comment.'} };
    this.modalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'modal-sm' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status === 'Yes') {
        this.Post_Service.Comment_Delete(this.Trigger_CommentInfo._id).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            const _index =  this.Posts_List[this.ActiveComment].Comments.findIndex(x => x._id === this.Trigger_CommentInfo._id);
            this.Posts_List[this.ActiveComment].Comments.splice(_index, 1);
            this.snackBar.open( 'Comment Successfully Deleted!' , ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          } else {
            this.snackBar.open( 'Comment Delete Failed Please Try Again!' , ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          }
        });
      } else {
        this.snackBar.open( 'Comment Delete Confirmation Declined!' , ' ', {
          horizontalPosition: 'center',
          duration: 3000,
          verticalPosition: 'top',
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
            this.snackBar.open( 'You Report Accepted!!', ' ', {
              horizontalPosition: 'center',
              duration: 3000,
              verticalPosition: 'top',
            });
          });
      } else {
        this.snackBar.open( 'You Already Report This Comment!!', ' ', {
          horizontalPosition: 'center',
          duration: 3000,
          verticalPosition: 'top',
        });
      }
    });
  }

}
