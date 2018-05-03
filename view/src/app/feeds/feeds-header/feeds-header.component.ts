import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { PostSubmitService } from './../../component-connecting/post-submit/post-submit.service';
import { CreatePostComponent } from './../../Modal_Components/create-post/create-post.component';

import { PostService } from './../../service/post/post.service';

@Component({
  selector: 'app-feeds-header',
  templateUrl: './feeds-header.component.html',
  styleUrls: ['./feeds-header.component.css']
})
export class FeedsHeaderComponent implements OnInit {

  SearchList: any[] = [];
  selected: String;

  modalRef: BsModalRef;

  UsersBaseUrl = 'http://localhost:3000/API/Uploads/Users/';

  lists;
  LoginUser;
  Active_Page;
  Notifications_List;
  Notification_Count = 0;

  constructor(private active_route: ActivatedRoute,
    private modalService: BsModalService,
    private router: Router,
    public Post_Service: PostService,
    public Post_connecting_change: PostSubmitService) {
      this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
      this.Active_Page = this.active_route.routeConfig.path;

      this.find_notification();
   }

  ngOnInit() {
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
console.log(_Notyify_Id);

    const _index =  this.Notifications_List.findIndex(x => x._id === _Notyify_Id);
    this.Post_Service.Notifications_viewed(this.Notifications_List[_index]._id).subscribe(data => {
      console.log(data);
    });
    this.Notifications_List.splice(_index, 1);
    this.router.navigate(['/Post_View', _id]);
  }
  typeaheadOnSelect(e: TypeaheadMatch): void {
    console.log(e.item._id);
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
