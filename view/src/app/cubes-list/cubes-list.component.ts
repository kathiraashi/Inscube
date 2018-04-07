import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { CreateCubeComponent } from './../Modal_Components/create-cube/create-cube.component';

@Component({
  selector: 'app-cubes-list',
  templateUrl: './cubes-list.component.html',
  styleUrls: ['./cubes-list.component.css']
})
export class CubesListComponent implements OnInit {

  modalRef: BsModalRef;

  CategoryBaseUrl = 'http://localhost:3000/API/Uploads/Category/';

  lists;

  constructor(private modalService: BsModalService) {}

  ngOnInit() {
  }

  openConfirmDialog() {
    const initialState = { title: 'Modal with component' };
      this.modalRef = this.modalService.show(CreateCubeComponent, {initialState});
      this.modalRef.content.onClose.subscribe(result => {
          console.log('results', result);
      });
  }

  logDate() {
    console.log(this.lists);
  }

}
