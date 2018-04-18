import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

const API_URL = 'http://localhost:3000/API/Signin_Signup/';

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


}
