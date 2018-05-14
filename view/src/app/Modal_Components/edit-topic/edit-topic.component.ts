import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Subject } from 'rxjs/Subject';

import { MatSnackBar } from '@angular/material';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';

import { CubeService } from './../../service/cube/cube.service';

import { CubeViewRelatedService } from './../../component-connecting/cube-view-related/cube-view-related.service';


@Component({
  selector: 'app-edit-topic',
  templateUrl: './edit-topic.component.html',
  styleUrls: ['./edit-topic.component.css']
})
export class EditTopicComponent implements OnInit {
  modalRef: BsModalRef;

  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';
  TopicBaseUrl = 'http://localhost:3000/API/Uploads/Topic_Attachments/';

  data;

  onClose: Subject<Object>;

  @ViewChild('imageInput') imageInput: ElementRef;
  @ViewChild('videoInput') videoInput: ElementRef;

  List_Img_Files: any[] = [];
  List_Img_Preview: any[] = [];
  List_Video_Files: any[] = [];
  List_Video_Preview: any[] = [];

  Old_Img_Preview: any[] = [];
  Old_Video_Preview: any[] = [];

  Post_Submit: Boolean = false;

  LoginUser;
  Form: FormGroup;
  FormData: FormData = new FormData;

  constructor(private modalService: BsModalService,
              public _bsModalRef: BsModalRef,
              private formBuilder: FormBuilder,
              public snackBar: MatSnackBar,
              public Cube_Service: CubeService,
              public Cube_View_Service: CubeViewRelatedService
            ) {
              this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
            }

  ngOnInit() {
    this.onClose = new Subject();

    this.Form = this.formBuilder.group({
      Topic_Id: new FormControl(this.data.Topic_Info._id, Validators.required),
      Cube_Id: new FormControl(this.data.Topic_Info.Cube_Id, Validators.required),
      Title: new FormControl(this.data.Topic_Info.Name, Validators.required),
      Text: new FormControl(this.data.Topic_Info.Description)
    });

    const Old_Attachments = this.data.Topic_Info.Attachments;
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

  Remove_Old_Img(index) {
    this.Old_Img_Preview.splice(index, 1);
  }
  Remove_Old_Video(index) {
    this.Old_Video_Preview.splice(index, 1);
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

  onSubmit() {
    if (this.Form.valid) {
        this.Post_Submit = true;
        this.FormData.set('attachments', '');
        this.FormData.set('User_Id', this.LoginUser._id);
        this.FormData.set('Topic_Id', this.Form.controls['Topic_Id'].value);
        this.FormData.set('Cube_Id', this.Form.controls['Cube_Id'].value);
        this.FormData.set('Name', this.Form.controls['Title'].value);
        this.FormData.set('Description', this.Form.controls['Text'].value);

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

        this.Cube_Service.Update_Cube_Topic(this.FormData).subscribe( datas => {
            if (datas['Status'] === 'True' && datas['Output'] === 'True') {
                    this.onClose.next({Status: true, Response: datas['Response'] });
                    this._bsModalRef.hide();
            } else {
                this.Post_Submit = false;
                this.onClose.next({Status: false });
                this._bsModalRef.hide();
            }
        });
    } else {
        if (this.Form.controls['Title'].value === '') {
            this.snackBar.open( 'Topic title is monitory !', ' ', {
                horizontalPosition: 'center',
                duration: 3000,
                verticalPosition: 'top',
            });
        }

    }
}


}
