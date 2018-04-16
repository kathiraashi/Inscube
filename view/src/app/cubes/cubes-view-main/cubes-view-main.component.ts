import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cubes-view-main',
  templateUrl: './cubes-view-main.component.html',
  styleUrls: ['./cubes-view-main.component.css']
})
export class CubesViewMainComponent implements OnInit {

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe( params => console.log(params) );
  }

  ngOnInit() {
  }

}
