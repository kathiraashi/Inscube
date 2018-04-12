import { Component, OnInit, ElementRef  } from '@angular/core';

import { MatSnackBar } from '@angular/material';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { EmoteAddComponent } from './../../Modal_Components/emote-add/emote-add.component';

import { PostService } from './../../service/post/post.service';

import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';

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
  constructor(public snackBar: MatSnackBar,
              private modalService: BsModalService,
              public Post_Service: PostService,
              public _componentConnectService: PostSubmitService,
              private elementRef: ElementRef,
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
      console.log(this.Posts_List[Post_Index]._id);
      this.Post_Service.Comment_List(this.Posts_List[Post_Index]._id).subscribe( datas => {
        console.log(datas);
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
    console.log(Comment_Text + '---' + Post_Index );
  }


}
