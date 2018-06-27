import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CubeViewRelatedService } from './../../component-connecting/cube-view-related/cube-view-related.service';

@Component({
  selector: 'app-cubes-view-main',
  templateUrl: './cubes-view-main.component.html',
  styleUrls: ['./cubes-view-main.component.css']
})
export class CubesViewMainComponent implements OnInit {

  View_Source = 'Posts';

  Active_Tab = 'Highlights';

  constructor(private active_route: ActivatedRoute,
              private Cube_View_Source: CubeViewRelatedService
            ) {
  }

  ngOnInit() {
    this.Cube_View_Source.currentMessage.subscribe(data => {
      if (data !== '') {
        this.View_Source = data;
      }
    });
  }

  ChangeActiveTab(name) {
    if (name !== this.Active_Tab) {
      this.Active_Tab = name;
    }
  }

}
