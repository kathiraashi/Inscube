import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatSnackBar } from '@angular/material';

import { CubeService } from './../service/cube/cube.service';
import { DataSharedVarServiceService } from './../service/data-shared-var-service/data-shared-var-service.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  CategoryBaseUrl = 'http://www.inscube.com/API/Uploads/Category/';

  Category_List;

  constructor( private router: Router,
              private Service: CubeService,
              public snackBar: MatSnackBar,
              private ShareingService: DataSharedVarServiceService) { }

  ngOnInit() {
    this.Service.Category_List().subscribe( datas => {
      if (datas['Status'] === 'True') {
        this.Category_List = datas['Response'];
      } else {
        this.router.navigate(['Cube_Posts']);
      }

    });
  }

  Cube_List_Now(Cat_id, Cat_Name) {
    this.ShareingService.SetCategory_Id(Cat_id, Cat_Name);
    this.router.navigate(['Cubes_List']);
  }

}
