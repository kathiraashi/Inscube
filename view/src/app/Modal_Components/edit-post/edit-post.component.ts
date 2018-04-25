import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import { MatSnackBar } from '@angular/material';

import { CubeService } from './../../service/cube/cube.service';
import { PostService } from './../../service/post/post.service';


@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent implements OnInit {



  UsersBaseUrl = 'http://www.inscube.com/API/Uploads/Users/';
  CubeBaseUrl = 'http://www.inscube.com/API/Uploads/Cubes/';
  PostBaseUrl = 'http://www.inscube.com/API/Uploads/Post_Attachments/';

  data;

  types = [
      {label: 'Story', value: 'Story'},
      {label: 'News', value: 'News'},
      {label: 'Article/Blog', value: 'Article/Blog'},
      {label: 'Idea', value: 'Idea'},
      {label: 'Curiosity', value: 'Curiosity'},
      {label: 'Talent', value: 'Talent'},
      {label: 'Question', value: 'Question'},
      {label: 'Moments', value: 'Moments'}
  ];

  selectedType: String = 'Story';

  ImageInputActive: Boolean = false;
  VideoInputActive: Boolean = false;
  LinkInputActive: Boolean = false;

  onClose: Subject<Object>;

  @ViewChild('imageInput') imageInput: ElementRef;
  @ViewChild('videoInput') videoInput: ElementRef;

  List_Img_Files: any[] = [];
  List_Img_Preview: any[] = [];
  List_Video_Files: any[] = [];
  List_Video_Preview: any[] = [];

  Old_Img_Preview: any[] = [];
  Old_Video_Preview: any[] = [];

  Cubes_List: any[] = [];
  Selected_Cube: any[] = [];

  slice_Count = 0;

   placeholder = 'Share your story';

  Post_Submit: Boolean = false;

  LoginUser;
  Form: FormGroup;
  FormData: FormData = new FormData;

  constructor(
      public _bsModalRef: BsModalRef,
      private formBuilder: FormBuilder,
      public snackBar: MatSnackBar,
      public Cube_Service: CubeService,
      public Post_Service: PostService
  ) {
      this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
      this.Cube_Service.User_Followed_Cubes(this.LoginUser._id).subscribe( datas => {
          if (datas['Status'] === 'True') {
              this.Cubes_List = datas['Response'];
              this.Cubes_List.map(v => v.Selected = false);
              this.Selected_Cubes_Fix();
          }
      });
  }

  ngOnInit(): void {
      this.onClose = new Subject();

      if (this.data.Post_Info.Post_Link !== '' ) {
        this.LinkInputActive = true;
      }

      this.selectedType = this.data.Post_Info.Post_Category;

      this.Form = this.formBuilder.group({
          User_Id: new FormControl(this.LoginUser._id, Validators.required),
          Post_Id: new FormControl(this.data.Post_Info._id, Validators.required),
          Post_Type: new FormControl(this.data.Post_Info.Post_Category,  Validators.required),
          Post_Text: new FormControl(this.data.Post_Info.Post_Text),
          Post_Link: new FormControl(this.data.Post_Info.Post_Link)
        });

  }

  Category_Change(event: any) {
    if (event.value === 'Story') {
        this.placeholder = 'Share your story';
    } else if (event.value === 'News') {
        this.placeholder = 'Share an announcement';
    } else if (event.value === 'Article/Blog') {
        this.placeholder = 'Write an article';
    } else if (event.value === 'Idea') {
        this.placeholder = 'Share an idea';
    } else if (event.value === 'Curiosity') {
        this.placeholder = 'What if..?';
    } else if (event.value === 'Talent') {
        this.placeholder = 'Express your talent';
    } else if (event.value === 'Question') {
        this.placeholder = 'Ask a question';
    } else {
        this.placeholder = 'Share what`s happening';
    }
}

  Selected_Cubes_Fix() {
    const Old_Cube_Ids = this.data.Post_Info.Cubes_Id;
    for (let index = 0; index < Old_Cube_Ids.length; index++) {
      const Cube_Id = Old_Cube_Ids[index];
      this.Cubes_List.map(v => {
        if (Cube_Id === v._id ) {
          v.Selected = true;
          this.slice_Count = this.slice_Count + 1;
          this.Selected_Cube.push(v._id);
        }
      });
    }
    if (this.slice_Count < 7 ) {
        this.slice_Count = 7;
      }
    this.Cubes_List = this.Cubes_List.sort(function(a, b) { return a.Selected === b.Selected ? 0 :  a.Selected ? -1 : 1; });
    const Old_Attachments = this.data.Post_Info.Attachments;
    for (let index = 0; index < Old_Attachments.length; index++) {
      const Attachment_Info = Old_Attachments[index];
      if (Attachment_Info.File_Type === 'Image' ) {
        this.Old_Img_Preview.push(Attachment_Info);
      }
      if (Attachment_Info.File_Type === 'Video' ) {
        this.Old_Video_Preview.push(Attachment_Info);
      }
    }
  }

  select_More_Model() {
    const Add_Count = 8;
    this.slice_Count = this.slice_Count + Add_Count;
    }

  Remove_Old_Img(index) {
    this.Old_Img_Preview.splice(index, 1);
  }
  Remove_Old_Video(index) {
    this.Old_Video_Preview.splice(index, 1);
  }

  LinkInputActiveToggle() {
      this.LinkInputActive = !this.LinkInputActive;
  }

  onImageFileChange(event) {
      if (event.target.files && event.target.files.length > 0) {
          const files = event.target.files;
          for (let index = 0; index < files.length; index++) {
              const element = files[index];
              this.List_Img_Files.push(element);
              const reader = new FileReader();
              reader.readAsDataURL(element);
              reader.onload = (events) => {
                  this.List_Img_Preview.push(events.target['result']);
              };
          }
      } else {
          console.log('Close');
      }
  }

  Remove_Img_file(index) {
      this.List_Img_Files.splice(index, 1);
      this.List_Img_Preview.splice(index, 1);
  }

  onVideoFileChange(event) {
      if (event.target.files && event.target.files.length > 0) {
          const files = event.target.files;
          for (let index = 0; index < files.length; index++) {
              const element = files[index];
              this.List_Video_Files.push(element);
              const reader = new FileReader();
              reader.readAsDataURL(element);
              reader.onload = (events) => {
                  this.List_Video_Preview.push(events.target['result']);
              };
          }
      } else {
          console.log('Close');
      }
  }

  Remove_Video_file(index) {
      this.List_Video_Files.splice(index, 1);
      this.List_Video_Preview.splice(index, 1);
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

  onSubmit() {
      if (this.Form.valid && this.Selected_Cube.length > 0 ) {
          this.Post_Submit = true;
          this.FormData.set('attachments', '');
          const Cubes_List = JSON.stringify(this.Selected_Cube);
          this.FormData.set('User_Id', this.Form.controls['User_Id'].value);
          this.FormData.set('Post_Id', this.Form.controls['Post_Id'].value);
          this.FormData.set('Post_Category', this.Form.controls['Post_Type'].value);
          this.FormData.set('Cubes_Id', Cubes_List);
          this.FormData.set('Post_Text', this.Form.controls['Post_Text'].value);
          this.FormData.set('Post_Link', this.Form.controls['Post_Link'].value);

          if (this.List_Img_Files.length > 0 || this.List_Video_Files.length > 0 ) {
            let Files = [];
            if (this.List_Video_Files.length > 0) {
                Files = Files.concat(this.List_Video_Files);
            }
            if (this.List_Img_Files.length > 0) {
                Files = Files.concat(this.List_Img_Files);
            }
            for (let index = 0; index < Files.length; index++) {
                const file = Files[index];
                this.FormData.append('attachments', file, file.name);
            }
          }
          if (this.Old_Img_Preview.length > 0 || this.Old_Video_Preview.length > 0 ) {
            let Old_Files = [];
            if (this.Old_Img_Preview.length > 0) {
              Old_Files = Old_Files.concat(this.Old_Img_Preview);
            }
            if (this.Old_Video_Preview.length > 0) {
              Old_Files = Old_Files.concat(this.Old_Video_Preview);
            }
            const Old_Files_String = JSON.stringify(Old_Files);
            this.FormData.set('Old_Attachments', Old_Files_String);

          }

          this.Post_Service.Cube_Post_Update(this.FormData).subscribe( datas => {
              if (datas['Status'] === 'True' && datas['Output'] === 'True') {
                    //   this.snackBar.open( 'Post Successfully Updated' , ' ', {
                    //   horizontalPosition: 'center',
                    //   duration: 3000,
                    //   verticalPosition: 'top',
                    //   });
                      this.onClose.next({Status: true, Response: datas['Response'] });
                      this._bsModalRef.hide();
              } else {
                //   this.Post_Submit = false;
                //   this.snackBar.open( 'Post Update Failed Please Try Again !!', ' ', {
                //   horizontalPosition: 'center',
                //   duration: 3000,
                //   verticalPosition: 'top',
                //   });
                  this.onClose.next({Status: false });
                  this._bsModalRef.hide();
              }
          });
      } else {
          if ( this.Selected_Cube.length <= 0 ) {
              this.snackBar.open( 'Select at least one cube !', ' ', {
                  horizontalPosition: 'center',
                  duration: 3000,
                  verticalPosition: 'top',
                  });
          }
          if (this.Form.controls['Post_Text'].value === '' ) {
              this.snackBar.open( 'Write some words !', ' ', {
                  horizontalPosition: 'center',
                  duration: 3000,
                  verticalPosition: 'top',
              });
          }

      }
  }



}
