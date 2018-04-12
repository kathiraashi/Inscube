import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

const API_URL = 'http://localhost:3000/API/Posts/';

@Injectable()
export class PostService {

    constructor( private http: Http) {  }

    private handleError (error: Response | any) {
        console.error('ApiService::handleError', error);
        return Observable.throw(error);
    }

    public Cube_Post_Submit(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'Cube_Post_Submit', data)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Cube_Post_List(User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Cube_Post_List/' + User_Id )
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Emote_Submit(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'Emote_Submit', data)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Comment_Submit(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'Comment_Submit', data)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Comment_List(Post_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Comment_List/' + Post_Id )
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }


}
