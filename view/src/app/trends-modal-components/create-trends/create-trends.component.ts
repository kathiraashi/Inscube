import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';

import { MatSnackBar } from '@angular/material';

import { CubeService } from './../../service/cube/cube.service';
import { TrendsService } from './../../service/trends/trends.service';

import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';

@Component({
  selector: 'app-create-trends',
  templateUrl: './create-trends.component.html',
  styleUrls: ['./create-trends.component.css']
})
export class CreateTrendsComponent implements OnInit {


  modalRef: BsModalRef;

  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:3000/API/Uploads/Cubes/';

  title: string;

  onClose: Subject<Object>;

  Cubes_List: any[] = [];
  Selected_Cube: any[] = [];

  slice_Count = 7;
  Post_Submit: Boolean = false;

  search_text: String;
  status: { isopen: boolean } = { isopen: false };
  Search_Tags: any[] = [];
  Spinner: Boolean = false;
  Selected_Tags: any[] = [];

  LoginUser;
  Form: FormGroup;
  FormData: FormData = new FormData;

  constructor(
      private modalService: BsModalService,
      public _bsModalRef: BsModalRef,
      private formBuilder: FormBuilder,
      public snackBar: MatSnackBar,
      public Cube_Service: CubeService,
      public Service: TrendsService,
      public _Submit_change: PostSubmitService
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
          Trends_Text: new FormControl('', Validators.required),
          Cube_Ids: new FormControl(''),
          Tags: new FormControl(''),
        });

  }

  Search_Text_change(value) {
    if (this.search_text !== undefined && this.search_text !== '' && this.search_text !== '#') {
      this.Spinner = true;
      value = value.replace(/#/gi, '');
        this.Service.Search_Trends_Tag(value).subscribe(datas => {
        this.status.isopen = true;
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Tags = datas['Response'];
            this.Search_Tags.map(v => {
                v.Tag = '#' + v.Tag;
                return v;
            });
            this.Search_Tags = this.Search_Tags.filter(item => this.Selected_Tags.indexOf(item.Tag) < 0);
          } else {
            this.Search_Tags = [];
          }
        });
    } else {
      this.Search_Tags = [];
      this.status.isopen = false;
    }
  }

  CreateNewTag() {
    if (this.search_text !== undefined && this.search_text !== '' && this.search_text !== '#') {
        this.Selected_Tags.push('#' + this.search_text);
        this.Search_Tags = [];
        this.status.isopen = false;
        this.search_text = '';
    }
  }

  pushTag(_index) {
    this.Selected_Tags.push(this.Search_Tags[_index].Tag);
    this.Search_Tags = [];
    this.status.isopen = false;
    this.search_text = '';
  }
  removeTag(_index) {
    this.Selected_Tags.splice(_index, 1);
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
      if (this.Form.valid && this.Selected_Cube.length > 0 && this.Selected_Tags.length > 0) {
          this.Post_Submit = true;
          const String_Tags = JSON.stringify(this.Selected_Tags);
          const Cubes_List = JSON.stringify(this.Selected_Cube);
          this.Form.controls['Cube_Ids'].setValue(Cubes_List);
          this.Form.controls['Tags'].setValue(String_Tags);

          this.Service.Cube_Trends_Submit(this.Form.value).subscribe( datas => {
              if (datas['Status'] === 'True' && datas['Output'] === 'True') {
                this._Submit_change.Trends_Submited(datas['Response']);
                    this.onClose.next({Status: true, Response: datas['Response'] });
                    this._bsModalRef.hide();
              } else {
                  this.Post_Submit = false;
                  this.onClose.next({Status: false });
                  this._bsModalRef.hide();
              }
          });
      } else {
        if ( this.Selected_Tags.length <= 0 ) {
            this.snackBar.open( 'Select or create at least one tag !', ' ', {
                horizontalPosition: 'center',
                duration: 3000,
                verticalPosition: 'top',
                });
        } else if ( this.Selected_Cube.length <= 0 ) {
            this.snackBar.open( 'Select at least one cube !', ' ', {
                horizontalPosition: 'center',
                duration: 3000,
                verticalPosition: 'top',
                });
        } else {
            this.snackBar.open( ' write campaign !', ' ', {
                horizontalPosition: 'center',
                duration: 3000,
                verticalPosition: 'top',
                });
        }
      }
  }

}
