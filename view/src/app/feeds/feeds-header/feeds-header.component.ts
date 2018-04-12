import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CreatePostComponent } from './../../Modal_Components/create-post/create-post.component';

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

  constructor( private modalService: BsModalService, private router: Router) {
      this.LoginUser = JSON.parse(localStorage.getItem('CurrentUser'));
   }

  ngOnInit() {
  }

  openConfirmDialog() {
    const initialState = { title: 'Modal with component' };
      this.modalRef = this.modalService.show(CreatePostComponent, Object.assign({initialState}, { class: 'maxWidth700 modal-lg' }));
      this.modalRef.content.onClose.subscribe(result => {
          console.log(result);
      });
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    console.log(e.item._id);
  }
  LogOut() {
    localStorage.removeItem('CurrentUser');
    localStorage.removeItem('UserToken');
    this.router.navigate(['/']);
  }


}
