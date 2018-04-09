import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CreatePostComponent } from './../../Modal_Components/create-post/create-post.component';

@Component({
  selector: 'app-feeds-left',
  templateUrl: './feeds-left.component.html',
  styleUrls: ['./feeds-left.component.css']
})
export class FeedsLeftComponent implements OnInit {

  modalRef: BsModalRef;

  CategoryBaseUrl = 'http://localhost:3000/API/Uploads/Category/';

  lists;

  constructor( private modalService: BsModalService, private router: Router) { }

  ngOnInit( ) {
  }

  openConfirmDialog() {
    const initialState = { title: 'Modal with component' };
      this.modalRef = this.modalService.show(CreatePostComponent, {initialState});
      this.modalRef.content.onClose.subscribe(result => {
          this.router.navigate(['Cube_Posts']);
      });
  }

  logDate() {
    console.log(this.lists);
  }

}
