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


  import { AuthGuard } from './guard/auth.guard';
  import { NotAuthGuard } from './guard/not-auth.guard';

// Feature Module
  import { FlexLayoutModule } from '@angular/flex-layout';
  import { BsDatepickerModule, TypeaheadModule, ModalModule  } from 'ngx-bootstrap';
  import { ScrollbarModule } from 'ngx-scrollbar';
  import { MomentModule } from 'angular2-moment';

// Service Module
  import { DataSharedVarServiceService } from './service/data-shared-var-service/data-shared-var-service.service';
  import { SigninSignupService } from './service/signin-signup/signin-signup.service';

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
import { CubeService } from './service/cube/cube.service';
import { PostService } from './service/post/post.service';
import { JoinConfirmationComponent } from './Modal_Components/join-confirmation/join-confirmation.component';
import { PostSubmitService } from './component-connecting/post-submit/post-submit.service';
import { EmoteAddComponent } from './Modal_Components/emote-add/emote-add.component';
import { EditPostComponent } from './Modal_Components/edit-post/edit-post.component';
import { DeleteConfirmationComponent } from './Modal_Components/delete-confirmation/delete-confirmation.component';
import { ReportPostComponent } from './Modal_Components/report-post/report-post.component';
import { ReportUserComponent } from './Modal_Components/report-user/report-user.component';
import { ReportCommentComponent } from './Modal_Components/report-comment/report-comment.component';
import { EditCommentComponent } from './Modal_Components/edit-comment/edit-comment.component';
import { SelectMoreCubesComponent } from './Modal_Components/select-more-cubes/select-more-cubes.component';



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
    CreatePostComponent,
    JoinConfirmationComponent,
    EmoteAddComponent,
    EditPostComponent,
    DeleteConfirmationComponent,
    ReportPostComponent,
    ReportUserComponent,
    ReportCommentComponent,
    EditCommentComponent,
    SelectMoreCubesComponent
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
      // Feature Module
        FlexLayoutModule,
        BsDatepickerModule.forRoot(),
        TypeaheadModule.forRoot(),
        ModalModule.forRoot(),
        ScrollbarModule,
        MomentModule
  ],
  providers: [
              AuthGuard,
              NotAuthGuard,
              DataSharedVarServiceService,
              SigninSignupService,
              CubeService,
              PostService,
              PostSubmitService,
            ],
  bootstrap: [AppComponent],
  entryComponents: [
                    CreateCubeComponent,
                    CreatePostComponent,
                    JoinConfirmationComponent,
                    EmoteAddComponent,
                    EditPostComponent,
                    DeleteConfirmationComponent,
                    ReportPostComponent,
                    ReportUserComponent,
                    ReportCommentComponent,
                    EditCommentComponent,
                    SelectMoreCubesComponent
                  ]
})
export class AppModule { }
