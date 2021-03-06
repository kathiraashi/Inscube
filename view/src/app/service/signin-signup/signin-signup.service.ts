import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

const API_URL = 'http://localhost:4000/API/Signin_Signup/';

@Injectable()
export class SigninSignupService {

    constructor( private http: Http) {  }

    private handleError (error: Response | any) {
        console.error('ApiService::handleError', error);
        return Observable.throw(error);
    }

    public NameValidate(name: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Inscube_Name_Validate/' + name)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public EmailValidate(email: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Email_Validate/' + email)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Register(data: any) {
        return this.http .post(API_URL + 'Register' , data)
        .map(response => {
                            const result = response.json();
                                if (result.Status === 'True' && result.Output === 'True') {
                                    const encodedata = btoa(Date());
                                    localStorage.setItem('UserToken', btoa(Date()));
                                    localStorage.setItem('CurrentUser', JSON.stringify(result.Response));
                                } else {
                                    localStorage.removeItem('CurrentUser');
                                }
                            return result;
                        }).catch(this.handleError);
    }

    public Country_List(): Observable<any[]>  {
        return this.http .get(API_URL + 'Country_List')
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }
    public State_List(Country_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'State_List/' + Country_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }
    public City_List(State_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'City_List/' + State_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Privacy_Update_Check(User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Privacy_Update_Check/' + User_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }
    public Privacy_Update_Agree(User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Privacy_Update_Agree/' + User_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

   public Explainer_Completed_Update(User_Id: any): Observable<any[]>  {
      return this.http .get(API_URL + 'Explainer_Completed_Update/' + User_Id)
      .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
   }


    public Register_Completion(data: any) {
        return this.http .post(API_URL + 'Register_Completion' , data)
        .map(response => {
                            const result = response.json();
                                if (result.Status === 'True' && result.Output === 'True') {
                                    localStorage.setItem('CurrentUser', JSON.stringify(result.Response));
                                }
                            return result;
        })
        .catch(this.handleError);
    }

    public UserValidate(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'User_Validate', data)
        .map(response => {
                        const result = response.json();
                            if (result.Status === 'True' && result.Output === 'True') {
                                const encodedata = btoa(Date());
                                localStorage.setItem('UserToken', btoa(Date()));
                                localStorage.setItem('CurrentUser', JSON.stringify(result.Response));
                            } else {
                                localStorage.removeItem('CurrentUser');
                            }
                        return result;
                    }) .catch(this.handleError);
    }

    public User_Info(User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'User_Info/' + User_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }


    public Privacy_Update(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'Privacy_Update', data)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Password_Change(data: any): Observable<any[]>  {
        return this.http .post(API_URL + 'Password_Change', data)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public Send_Email_Password_Reset_Request(email: any): Observable<any[]>  {
        return this.http .get(API_URL + 'Send_Email_Password_Reset_Request/' + email)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }

    public password_reset_url_check(User_Id: any, Token: any): Observable<any[]>  {
        return this.http .get(API_URL + 'password_reset_url_check/' + User_Id + '/' + Token)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }
    public password_reset_submit(Password: any, User_Id: any): Observable<any[]>  {
        return this.http .get(API_URL + 'password_reset_submit/' + Password + '/' + User_Id)
        .map(response => { const datas = response.json(); return datas; }) .catch(this.handleError);
    }



}
