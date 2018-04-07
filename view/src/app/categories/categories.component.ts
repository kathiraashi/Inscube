import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  CategoryBaseUrl = 'http://localhost:3000/API/Uploads/Category/';

  constructor( private router: Router ) { }

  ngOnInit() {
  }

  Cube_List_Now() {
    this.router.navigate(['Cubes_List']);
  }

}
