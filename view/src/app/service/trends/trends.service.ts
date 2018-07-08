import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

const API_URL = 'http://localhost:4000/API/Trends/';

@Injectable()
export class TrendsService {


   constructor( private http: Http) {  }

   private handleError (error: Response | any) {
      console.error('ApiService::handleError', error);
      return Observable.throw(error);
   }

   public Cube_Trends_Submit(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Cube_Trends_Submit', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Cube_Trends_Update(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Cube_Trends_Update', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
  }

   public Cube_Trends_List(User_Id: any, Skip_Count: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Cube_Trends_List/' + User_Id + '/' + Skip_Count )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Cube_Trends_View(User_Id: any, Trends_Id: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Cube_Trends_View/' + User_Id + '/' + Trends_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Cube_Trends_Delete(Trends_Id: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Cube_Trends_Delete/' + Trends_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Report_Trends_Check(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Report_Trends_Check', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Report_Trends(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Report_Trends', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Trends_Emote_Submit(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Trends_Emote_Submit', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Trends_Emote_Update(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Trends_Emote_Update', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Trends_Comment_Submit(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Trends_Comment_Submit', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Trends_Comment_Update(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Trends_Comment_Update', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Trends_Comment_Delete(Trends_Comment_Id: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Trends_Comment_Delete/' + Trends_Comment_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Trends_Comment_List(Trends_Id: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Trends_Comment_List/' + Trends_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Report_TrendsComment_Check(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Report_TrendsComment_Check', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Report_TrendsComment(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Report_TrendsComment', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Cube_Based_Trends_List(Cube_Id: any, User_Id: any ): Observable<any[]>  {
      return this.http .get(API_URL + 'Cube_Based_Trends_List/' + Cube_Id + '/' + User_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

    public CubeBased_Trends_Filter(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'CubeBased_Trends_Filter', data )
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public UserBased_Trends_Filter(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'UserBased_Trends_Filter', data )
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

   public User_Trends(User_Id: any ): Observable<any[]>  {
      return this.http .get(API_URL + 'User_Trends/' + User_Id )
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Cube_Trends_Share(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Cube_Trends_Share', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public Cube_Trends_Filter(data: any): Observable<any[]>  {
      return this.http .post(API_URL + 'Cube_Trends_Filter', data)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }

   public CubeTrends_TagId_Filter(data: any): Observable<any[]>  {
    return this.http .post(API_URL + 'CubeTrends_TagId_Filter', data)
    .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
 }

   public Search_Trends_Tag(Search_text: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Search_Trends_Tag/' + Search_text)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }


}
