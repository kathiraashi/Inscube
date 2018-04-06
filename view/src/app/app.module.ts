// Default Modules
  import { BrowserModule } from '@angular/platform-browser';
  import { NgModule } from '@angular/core';
  import { CommonModule} from '@angular/common';
  import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
  import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
  import { FormsModule, ReactiveFormsModule } from '@angular/forms';
  import { HttpModule } from '@angular/http';
  import { HttpClientModule } from '@angular/common/http';
  import { RouterModule, Routes } from '@angular/router';

// App Modules And Components
  import { AppComponent } from './app.component';
  import { AppRoutingModule } from './app.routing.module';
  import { MaterialModule } from './material.module';
  import { PrimengModule } from './primeng.module';

// Feture Module
  import { FlexLayoutModule } from '@angular/flex-layout';
  import { BsDatepickerModule } from 'ngx-bootstrap';

import { LoginComponent } from './login/login.component';
import { ProfileCompletionComponent } from './profile-completion/profile-completion.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileCompletionComponent
  ],
  imports: [
      // Default Modules
        BrowserModule,
        CommonModule,
        BrowserAnimationsModule,
        HttpModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
      // App Modules And Components
        AppRoutingModule,
        MaterialModule,
        PrimengModule,
      // Feture Module
        FlexLayoutModule,
        BsDatepickerModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
