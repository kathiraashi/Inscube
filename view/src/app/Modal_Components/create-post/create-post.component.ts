import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';

import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import { MatSnackBar } from '@angular/material';

import { CubeService } from './../../service/cube/cube.service';
import { PostService } from './../../service/post/post.service';

import { SelectMoreCubesComponent } from './../../Modal_Components/select-more-cubes/select-more-cubes.component';

import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {

    modalRef: BsModalRef;

    UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
    CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';

    title: string;
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

    Cubes_List: any[] = [];
    Selected_Cube: any[] = [];

    slice_Count = 7;
    Post_Submit: Boolean = false;

    placeholder = 'Share your story';

    LoginUser;
    Form: FormGroup;
    FormData: FormData = new FormData;

    constructor(
        private modalService: BsModalService,
        public _bsModalRef: BsModalRef,
        private formBuilder: FormBuilder,
        public snackBar: MatSnackBar,
        public Cube_Service: CubeService,
        public Post_Service: PostService,
        public Post_Submit_change: PostSubmitService
    ) {
        this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
        this.Cube_Service.User_Followed_Cubes(this.LoginUser._id).subscribe( datas => {
            if (datas['Status'] === 'True') {
                this.Cubes_List = datas['Response'];
                this.Cubes_List.map(v => v.Selected = false);
            }
        });
    }

    ngOnInit(): void {
        this.onClose = new Subject();

        this.Form = this.formBuilder.group({
            User_Id: new FormControl(this.LoginUser._id, Validators.required),
            Post_Type: new FormControl('Story',  Validators.required),
            Post_Text: new FormControl(''),
            Post_Link: new FormControl('')
          });

    }

    LinkInputActiveToggle() {
        this.LinkInputActive = !this.LinkInputActive;
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

    select_More_Model() {
        const Add_Count = 8;
        this.slice_Count = this.slice_Count + Add_Count;
    }

    onSubmit() {
        if (this.Form.valid && this.Selected_Cube.length > 0 ) {
            this.Post_Submit = true;
            this.FormData.set('attachments', '');
            const Cubes_List = JSON.stringify(this.Selected_Cube);
            this.FormData.set('User_Id', this.Form.controls['User_Id'].value);
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

            this.Post_Service.Cube_Post_Submit(this.FormData).subscribe( datas => {
                if (datas['Status'] === 'True' && datas['Output'] === 'True') {
                        this.snackBar.open( 'Post Successfully Submitted' , ' ', {
                        horizontalPosition: 'center',
                        duration: 3000,
                        verticalPosition: 'top',
                        });
                        this.Post_Submit_change.Post_Submited(datas['Response']);
                        this.onClose.next({Status: true, Response: datas['Response'] });
                        this._bsModalRef.hide();

                } else {
                    this.Post_Submit = false;
                    this.snackBar.open( 'Post Submit Failed Please Try Again !!', ' ', {
                    horizontalPosition: 'center',
                    duration: 3000,
                    verticalPosition: 'top',
                    });
                    this.onClose.next({Status: false });
                    this._bsModalRef.hide();
                }
            });
        } else {
            if ( this.Selected_Cube.length <= 0 ) {
                this.snackBar.open( 'Select At least One Cube !', ' ', {
                    horizontalPosition: 'center',
                    duration: 3000,
                    verticalPosition: 'top',
                    });
            }
            if (this.Form.controls['Post_Text'].value === '' && this.Form.controls['Post_Link'].value === '' &&
                 this.List_Img_Files.length <= 0 && this.List_Video_Files.length <= 0 ) {
                this.snackBar.open( 'Write Some Words !', ' ', {
                    horizontalPosition: 'center',
                    duration: 3000,
                    verticalPosition: 'top',
                });
            }

        }
    }



}
