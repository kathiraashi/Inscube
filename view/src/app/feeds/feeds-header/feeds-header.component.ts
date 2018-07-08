import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { ScrollbarComponent } from 'ngx-scrollbar';

import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';

import { PostService } from './../../service/post/post.service';
import { CaptureService } from './../../service/capture/capture.service';
import { TrendsService } from './../../service/trends/trends.service';

@Component({
  selector: 'app-feeds-header',
  templateUrl: './feeds-header.component.html',
  styleUrls: ['./feeds-header.component.css']
})
export class FeedsHeaderComponent implements OnInit {

  @ViewChild(ScrollbarComponent) scrollRef: ScrollbarComponent;
  modalRef: BsModalRef;

  UsersBaseUrl = 'http://localhost:4000/API/Uploads/Users/';
  CubeBaseUrl = 'http://localhost:4000/API/Uploads/Cubes/';

  status: { isopen: boolean } = { isopen: false };
  search_text: String;
  activeTab = 'Cubes';
  Search_Users: any[] = [];
  Search_Cubes: any[] = [];
  Search_Posts: any[] = [];
  Search_Captures: any[] = [];
  Search_Trends: any[] = [];
  Spinner: Boolean = false;

  lists;
  LoginUser;
  Active_Page;
  Notifications_List;
  Notification_Count = 0;

  constructor(private active_route: ActivatedRoute,
    private modalService: BsModalService,
    private router: Router,
    public Post_Service: PostService,
    public Capture_Service: CaptureService,
    public Trends_Service: TrendsService,
    public Post_connecting_change: PostSubmitService) {
      this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
      this.Active_Page = this.active_route.routeConfig.path;

      this.find_notification();
   }

  ngOnInit() {
  }

  change_activeTab(text) {
    this.scrollRef.scrollYTo(0);
    if (this.activeTab !== text) {
      this.activeTab = text;
      this.Spinner = true;
      if (text === 'Users') {
        this.Spinner = true;
        this.Post_Service.Search_Users(this.search_text).subscribe(datas => {
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Users = datas['Response'];
          } else {
            this.Search_Users = [];
          }
        });
      }
      if (text === 'Cubes') {
        this.Spinner = true;
        this.Post_Service.Search_Cubes(this.LoginUser._id, this.search_text).subscribe(datas => {
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Cubes = datas['Response'];
          } else {
            this.Search_Cubes = [];
          }
        });
      }
      if (text === 'Posts') {
        this.Post_Service.Search_Posts(this.LoginUser._id, this.search_text).subscribe(datas => {
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Posts = datas['Response'];
          } else {
            this.Search_Posts = [];
          }
        });
      }
      if (text === 'Captures') {
        this.Spinner = true;
        this.Capture_Service.Search_Captures(this.LoginUser._id, this.search_text).subscribe(datas => {
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Captures = datas['Response'];
          } else {
            this.Search_Captures = [];
          }
        });
      }
      if (text === 'Trends') {
        this.Spinner = true;
        this.Trends_Service.Search_Trends_Tag(this.search_text).subscribe(datas => {
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Trends = datas['Response'];
          } else {
            this.Search_Trends = [];
          }
        });
      }
    }
  }

  Search_Text_change(value) {
    if ( this.search_text !== '') {
      this.Spinner = true;
      this.status.isopen = true;
      if (this.activeTab === 'Cubes') {
        this.Post_Service.Search_Cubes(this.LoginUser._id, value).subscribe(datas => {
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Cubes = datas['Response'];
          } else {
            this.Search_Cubes = [];
          }
        });
      }
      if (this.activeTab === 'Users') {
        this.Post_Service.Search_Users(value).subscribe(datas => {
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Users = datas['Response'];
          } else {
            this.Search_Users = [];
          }
        });
      }
      if (this.activeTab === 'Posts') {
        this.Post_Service.Search_Posts(this.LoginUser._id, this.search_text).subscribe(datas => {
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Posts = datas['Response'];
          } else {
            this.Search_Posts = [];
          }
        });
      }
      if (this.activeTab === 'Captures') {
        this.Spinner = true;
        this.Capture_Service.Search_Captures(this.LoginUser._id, this.search_text).subscribe(datas => {
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Captures = datas['Response'];
          } else {
            this.Search_Captures = [];
          }
        });
      }
      if (this.activeTab === 'Trends') {
        this.Spinner = true;
        this.Trends_Service.Search_Trends_Tag(this.search_text).subscribe(datas => {
          this.Spinner = false;
          if (datas['Status'] === 'True' && datas['Output'] === 'True' && datas['Response'].length > 0) {
            this.Search_Trends = datas['Response'];
          } else {
            this.Search_Trends = [];
          }
        });
      }
    } else {
      this.Search_Users = [];
      this.Search_Cubes = [];
      this.Search_Posts = [];
      this.Search_Captures = [];
      this.Search_Trends = [];
      this.status.isopen = false;
    }
  }

  clear() {
    this.Search_Users = [];
    this.Search_Cubes = [];
    this.Search_Posts = [];
    this.Search_Captures = [];
    this.Search_Trends = [];
    this.search_text = '';
    this.status.isopen = false;
  }

  find_notification() {
    this.Post_Service.Get_Notification(this.LoginUser._id).subscribe( datas => {
      if (datas['Status'] === 'True') {
        this.Notification_Count = 0;
        this.Notifications_List = datas['Response'];
        this.Notifications_List.map(v => {
          if (v.View_Status === 0 ) {
            this.Notification_Count = this.Notification_Count + 1;
          }
         } );
      }
    });
  }

  notification_showing() {
      const Ids_Array = [];
      this.Notifications_List.map(v => {
        if (v.View_Status === 0 ) {
          Ids_Array.push(v._id);
        }
      });
      if (Ids_Array.length > 0) {
        const array = JSON.stringify(Ids_Array);
        const data = { User_Id: this.LoginUser._id, Notify_Ids: array};
        this.Post_Service.Notifications_recived(data).subscribe();
      }
  }

  View_Post(_id, _Notyify_Id) {
    const _index =  this.Notifications_List.findIndex(x => x._id === _Notyify_Id);
    this.Post_Service.Notifications_viewed(this.Notifications_List[_index]._id).subscribe(data => {
      console.log(data);
    });
    this.Notifications_List.splice(_index, 1);
    this.router.navigate(['/Post_View', _id]);
  }

  View_capture(_id, _Notyify_Id) {
    const _index =  this.Notifications_List.findIndex(x => x._id === _Notyify_Id);
    this.Post_Service.Notifications_viewed(this.Notifications_List[_index]._id).subscribe(data => {
      console.log(data);
    });
    this.Notifications_List.splice(_index, 1);
    this.router.navigate(['/Capture_View', _id]);
  }

  View_trends(_id, _Notyify_Id) {
    const _index =  this.Notifications_List.findIndex(x => x._id === _Notyify_Id);
    this.Post_Service.Notifications_viewed(this.Notifications_List[_index]._id).subscribe(data => {
      console.log(data);
    });
    this.Notifications_List.splice(_index, 1);
    this.router.navigate(['/Trends_View', _id]);
  }

  Activity_Check() {
    if (this.Active_Page !== 'Cube_Posts') {
      this.router.navigate(['/Cube_Posts']);
    } else {
      this.Post_connecting_change.Refersh_Feeds('RefreshNow');
      this.find_notification();
    }
  }

  LogOut() {
    localStorage.removeItem('CurrentUser');
    localStorage.removeItem('UserToken');
    this.router.navigate(['/']);
  }


}
