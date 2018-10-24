import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { NgxCarousel } from 'ngx-carousel';

import { CreateCubeComponent } from './../../Modal_Components/create-cube/create-cube.component';
import { CubeService } from './../../service/cube/cube.service';
import { JoinConfirmationComponent } from './../../Modal_Components/join-confirmation/join-confirmation.component';

@Component({
  selector: 'app-discover-cubes',
  templateUrl: './discover-cubes.component.html',
  styleUrls: ['./discover-cubes.component.css']
})
export class DiscoverCubesComponent implements OnInit {

  modalRef: BsModalRef;

  onClose: Subject<any>;

  public Category_List: Array<any> = [];
  public carouselTile: NgxCarousel;

  UsersBaseUrl = 'http://localhost:4000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:4000/API/Uploads/Cubes/';
  CategoryBaseUrl = 'http://localhost:4000/API/Uploads/Category/';

  LoginUser;
  Cubes_List;
  Original_Cubes_List;
  Loader_1: Boolean = true;
  Loader_2: Boolean = true;

  NameSearch: Boolean = true;

  ActiveCategory;

  Create_form_open: Boolean = false;

  data;

  constructor(  public _bsModalRef: BsModalRef,
                public Cube_Service: CubeService,
                private modalService: BsModalService,
                private router: Router
              ) {
                this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
              }

  ngOnInit() {
    this.onClose = new Subject();

    this.Cube_Service.Category_List().subscribe( datas => {
      if (datas['Status'] === 'True') {
        this.Loader_1 = false;
        this.Category_List = datas['Response'];
        this.Category_List.map(v => {
            v.selected = false;
        });
        this.Chanage_Category(0);
      }
    });

    this.carouselTile = {
      grid: { xs: 3, sm: 3, md: 4, lg: 4, all: 0 },
      speed: 600,
      interval: 3000,
      point: {
        visible: false,
      },
      load: 2,
      touch: true
    };

  }


  Chanage_Category(_index) {
    this.Loader_2 = true;
    this.Category_List.map(v => { v.selected = false; });
    this.ActiveCategory = this.Category_List[_index];
    this.Category_List[_index].selected = true;
    this.Cube_Service.Cubes_List(this.ActiveCategory._id, this.LoginUser._id).subscribe( datas => {
      this.Loader_2 = false;
      if (datas['Status'] === 'True') {
        this.Original_Cubes_List = datas['Response'];
        this.Cubes_List = datas['Response'];
      }
    });
  }

  SearchCubeName(value: string) {
    if (value !== '' && this.Cubes_List.length > 0) {
      this.NameSearch = true;
      this.Cubes_List = this.Original_Cubes_List.filter(Obj => Obj.Name.toLowerCase().indexOf(value.toLowerCase()) > -1 );
    } else {
      this.NameSearch = false;
      this.Cubes_List = this.Original_Cubes_List;
    }
  }

  SearchCountryName(value: string) {
    if (value !== '' && this.Cubes_List.length > 0) {
      this.NameSearch = true;
      this.Cubes_List = this.Original_Cubes_List.filter(Obj => Obj.Country_Location.toLowerCase().indexOf(value.toLowerCase()) > -1 );
    } else {
      this.NameSearch = false;
      this.Cubes_List = this.Original_Cubes_List;
    }
  }

  JoinCodeGet(Cube_Index) {
    this.Create_form_open = true;
    const initialState = { data: { Cube_Info:  this.Cubes_List[Cube_Index] } };
      this.modalRef = this.modalService.show(JoinConfirmationComponent,
        Object.assign({initialState}, {ignoreBackdropClick: true, class: 'maxWidth400'}));
      this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Success') {
          this.Create_form_open = false;
          this.Cubes_List.splice(Cube_Index, 1);
        } else {
          this.Create_form_open = false;
        }
      });
  }

  DirectJoin(Cube_Index) {
    const data = { User_Id: this.LoginUser._id, Cube_Id: this.Cubes_List[Cube_Index]._id };
        this.Cube_Service.Follow_Cube(data).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
              this.Cubes_List.splice(Cube_Index, 1);
          }
      });
  }

  GotoCubeView(_id) {
      this.router.navigate(['Cube_View', _id ]);
      this._bsModalRef.hide();
  }

  openConfirmDialog() {
    this.Create_form_open = true;
    const initialState = { data: { Category_Info :  this.ActiveCategory } };
      this.modalRef = this.modalService.show(CreateCubeComponent,
        Object.assign({initialState}, {ignoreBackdropClick: true, class: 'maxWidth700'}) );
      this.modalRef.content.onClose.subscribe(result => {
        if (result.Status === 'Success') {
          setTimeout(() => {
            this.router.navigate(['Cube_View', result.Response._id ]);
            this._bsModalRef.hide();
          }, 500);
        } else {
          this.Create_form_open = false;
        }
      });
  }

}
