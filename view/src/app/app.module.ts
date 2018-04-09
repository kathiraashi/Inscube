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
  import { BsDatepickerModule, TypeaheadModule, ModalModule  } from 'ngx-bootstrap';
  import { ScrollbarModule } from 'ngx-scrollbar';

import { LoginComponent } from './login/login.component';
import { ProfileCompletionComponent } from './profile-completion/profile-completion.component';
import { CategoriesComponent } from './categories/categories.component';
import { CubesListComponent } from './cubes-list/cubes-list.component';
import { CreateCubeComponent } from './Modal_Components/create-cube/create-cube.component';
import { FeedsMainComponent } from './feeds/feeds-main/feeds-main.component';
import { FeedsHeaderComponent } from './feeds/feeds-header/feeds-header.component';
import { FeedsLeftComponent } from './feeds/feeds-left/feeds-left.component';
import { FeedsRightComponent } from './feeds/feeds-right/feeds-right.component';
import { FeedsCenterComponent } from './feeds/feeds-center/feeds-center.component';
import { CreatePostComponent } from './Modal_Components/create-post/create-post.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileCompletionComponent,
    CategoriesComponent,
    CubesListComponent,
    CreateCubeComponent,
    FeedsMainComponent,
    FeedsHeaderComponent,
    FeedsLeftComponent,
    FeedsRightComponent,
    FeedsCenterComponent,
    CreatePostComponent
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
        BsDatepickerModule.forRoot(),
        TypeaheadModule.forRoot(),
        ModalModule.forRoot(),
        ScrollbarModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
                    CreateCubeComponent,
                    CreatePostComponent
                  ]
})
export class AppModule { }
