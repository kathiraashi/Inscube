import { Component, OnInit } from '@angular/core';

import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

@Component({
  selector: 'app-feeds-header',
  templateUrl: './feeds-header.component.html',
  styleUrls: ['./feeds-header.component.css']
})
export class FeedsHeaderComponent implements OnInit {

  SearchList: any[] = [];
  selected: String;
  constructor() { }

  ngOnInit() {
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    console.log(e.item._id);
  }


}
