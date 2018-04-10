import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

const API_URL = 'http://localhost:3000/API/Cubes/';

@Injectable()
export class CubeService {

  constructor( private http: Http) {  }

  private handleError (error: Response | any) {
      console.error('ApiService::handleError', error);
      return Observable.throw(error);
  }

  public Category_List(): Observable<any[]>  {
      return this.http .get(API_URL + 'Category_List')
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
  }
  public Cubes_List(Cat_Id: any, User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Cube_List/' + Cat_Id + '/' + User_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

}
