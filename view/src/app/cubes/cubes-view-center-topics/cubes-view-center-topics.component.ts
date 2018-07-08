import { Component, OnInit, ElementRef, TemplateRef  } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router, ActivatedRoute } from '@angular/router';

import { MatSnackBar } from '@angular/material';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { NgxCarousel } from 'ngx-carousel';
import { Lightbox } from 'angular2-lightbox';

import { EditTopicComponent } from './../../Modal_Components/edit-topic/edit-topic.component';
import { DeleteConfirmationComponent } from './../../Modal_Components/delete-confirmation/delete-confirmation.component';

import { CubeViewRelatedService  } from './../../component-connecting/cube-view-related/cube-view-related.service';


import { CubeService } from './../../service/cube/cube.service';

@Component({
  selector: 'app-cubes-view-center-topics',
  templateUrl: './cubes-view-center-topics.component.html',
  styleUrls: ['./cubes-view-center-topics.component.css']
})
export class CubesViewCenterTopicsComponent implements OnInit {

  UsersBaseUrl = 'http://localhost:4000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:4000/API/Uploads/Cubes/';
  TopicBaseUrl = 'http://localhost:4000/API/Uploads/Topic_Attachments/';

  scrollHeight;
  screenHeight: number;

  modalRef: BsModalRef;
  carouselBanner: NgxCarousel;
  carouselOne: NgxCarousel;

  Loader_1: Boolean = true;

  LoginUser;
  Topics_List: any = [];
  Cube_Id;
  Cube_Info;
  video_Url;
  Trigger_TopicInfo;

  FormData: FormData = new FormData;

  constructor(  private active_route: ActivatedRoute,
                public snackBar: MatSnackBar,
                private modalService: BsModalService,
                public Cube_Service: CubeService,
                private router: Router,
                private elementRef: ElementRef,
                private _lightbox: Lightbox,
                private _componentConnectService: CubeViewRelatedService
            ) {
                this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
                this.active_route.url.subscribe((u) => {
                  this.Cube_Id = this.active_route.snapshot.params['Cube_Id'];

                  this.Cube_Service.View_Cube(this.Cube_Id, this.LoginUser._id).subscribe( datas => {
                    this.Loader_1 = false;
                    if (datas['Status'] === 'True') {
                      this.Cube_Info = datas['Response'];
                        this.Topics_List = datas['Response'].Topics;
                    }
                  });
                    this._componentConnectService.New_Topic.subscribe(data => {
                      this.Topics_List.splice(0 , 0, data);
                    });
                });
            }

  ngOnInit() {
    this.screenHeight = window.innerHeight - 80;
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
  }

  Show_Image(URL) {
    const _album: Array<any> = [{ src: URL}];
    this._lightbox.open(_album, 0);
  }

  Show_Video(template: TemplateRef<any>, URL) {
    this.modalRef = this.modalService.show(template,  Object.assign({}, { class: 'modal-lg' }));
    this.video_Url = URL;
  }

   Trigger_Topic(index) {
    this.Trigger_TopicInfo = this.Topics_List[index];
  }

  EditTopic_Model() {
    const initialState = { data: { Topic_Info: this.Trigger_TopicInfo, Cube_Info: this.Cube_Info } };
    this.modalRef = this.modalService.show(EditTopicComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status) {
        const _index =  this.Topics_List.findIndex(x => x._id === result.Response._id);
        this.Topics_List[_index] = result.Response;
      }
    });
  }

  DeleteTopic_Model() {
    const initialState = { data: { Text : 'Are you sure! ', Text_1 : 'Deleting will permanently remove it from inscube'} };
    this.modalRef = this.modalService.show(DeleteConfirmationComponent, Object.assign({initialState}, { class: 'maxWidth400' }));
    this.modalRef.content.onClose.subscribe(result => {
      if (result.Status === 'Yes') {
        const data = {
          User_Id: this.LoginUser._id,
          Topic_Id: this.Trigger_TopicInfo._id,
          Cube_Id: this.Cube_Info._id
        };
        this.Cube_Service.Delete_Topic(data).subscribe( datas => {
          if (datas['Status'] === 'True' && datas['Output'] === 'True') {
            const _index =  this.Topics_List.findIndex(x => x._id === this.Trigger_TopicInfo._id);
            this.Topics_List.splice(_index, 1);
          }
        });
      }
    });
  }

}
