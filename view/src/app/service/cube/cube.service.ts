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

    public Category_Info(Cat_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Category_Info/' + Cat_Id )
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Cubes_List(Cat_Id: any, User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Cube_List/' + Cat_Id + '/' + User_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public View_Cube(Cube_Id: any, User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'View_Cube/' + Cube_Id + '/' + User_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Create_Cube(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'Cube_Creation', data)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public User_Followed_Cubes(User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'User_Followed_Cubes/' + User_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Follow_Cube(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'Follow_Cube', data)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public UnFollow_Cube(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'UnFollow_Cube', data)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public User_Cubes(User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'User_Cubes/' + User_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public User_UnFollowed_Cubes(User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'User_UnFollowed_Cubes/' + User_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Cube_Members(Cube_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Cube_Members/' + Cube_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Add_Cube_Topic(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'Add_Cube_Topic', data)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

}
