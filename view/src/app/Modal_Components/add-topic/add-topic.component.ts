import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Subject } from 'rxjs/Subject';

import { MatSnackBar } from '@angular/material';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';

import { CubeService } from './../../service/cube/cube.service';

import { CubeViewRelatedService } from './../../component-connecting/cube-view-related/cube-view-related.service';


@Component({
  selector: 'app-add-topic',
  templateUrl: './add-topic.component.html',
  styleUrls: ['./add-topic.component.css']
})
export class AddTopicComponent implements OnInit {

  modalRef: BsModalRef;

  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';

  data;

  onClose: Subject<Object>;

  @ViewChild('imageInput') imageInput: ElementRef;
  @ViewChild('videoInput') videoInput: ElementRef;

  List_Img_Files: any[] = [];
  List_Img_Preview: any[] = [];
  List_Video_Files: any[] = [];
  List_Video_Preview: any[] = [];

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
      Cube_Id: new FormControl(this.data.Cube_Info._id, Validators.required),
      Title: new FormControl('', Validators.required),
      Text: new FormControl('')
    });
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

        this.Cube_Service.Add_Cube_Topic(this.FormData).subscribe( datas => {
            if (datas['Status'] === 'True' && datas['Output'] === 'True') {
                    this.Cube_View_Service.New_Topic_Add(datas['Response']);
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
