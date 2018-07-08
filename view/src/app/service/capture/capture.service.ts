import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

const API_URL = 'http://localhost:4000/API/Capture/';

@Injectable()
export class CaptureService {

   constructor( private http: Http) {  }

   private handleError (error: Response | any) {
      console.error('ApiService::handleError', error);
      return Observable.throw(error);
   }

   public Cube_Capture_Delete(Capture_Id: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Cube_Capture_Delete/' + Capture_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Report_Capture_Check(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Report_Capture_Check', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Report_Capture(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Report_Capture', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Cube_Capture_List(User_Id: any, Skip_Count: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Cube_Capture_List/' + User_Id + '/' + Skip_Count )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Cube_Capture_View(User_Id: any, Capture_Id: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Cube_Capture_View/' + User_Id + '/' + Capture_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Capture_Emote_Submit(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Capture_Emote_Submit', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Capture_Emote_Update(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Capture_Emote_Update', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Capture_Comment_Submit(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Capture_Comment_Submit', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Capture_Comment_Update(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Capture_Comment_Update', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Capture_Comment_Delete(Capture_Comment_Id: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Capture_Comment_Delete/' + Capture_Comment_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Capture_Comment_List(Capture_Id: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Capture_Comment_List/' + Capture_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Report_CaptureComment_Check(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Report_CaptureComment_Check', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Report_CaptureComment(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Report_CaptureComment', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Cube_Based_Capture_List(Cube_Id: any, User_Id: any ): Observable<any[]>  {
      return this.http .get(API_URL + 'Cube_Based_Capture_List/' + Cube_Id + '/' + User_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public User_Captures(User_Id: any ): Observable<any[]>  {
      return this.http .get(API_URL + 'User_Captures/' + User_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Cube_Capture_Share(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Cube_Capture_Share', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Search_Captures(User_Id: any, text: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Search_Captures/' + User_Id + '/' + text)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
  }

}
