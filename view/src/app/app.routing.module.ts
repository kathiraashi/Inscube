import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { AuthGuard } from './guard/auth.guard';
import { NotAuthGuard } from './guard/not-auth.guard';

// Default
    import { LoginComponent } from './login/login.component';
    import { ProfileCompletionComponent } from './profile-completion/profile-completion.component';
    import { CategoriesComponent } from './categories/categories.component';
    import { CubesListComponent } from './cubes-list/cubes-list.component';
    import { FeedsMainComponent } from './feeds/feeds-main/feeds-main.component';

const appRoutes: Routes = [
    { path: '',
        component: LoginComponent,
        data: { animation: { value: 'Login', } },
        canActivate: [NotAuthGuard]
    },
    { path: 'Profile_Completion',
        component: ProfileCompletionComponent,
        data: { animation: { value: 'Profile_Completion', } },
        canActivate: [AuthGuard]
    },
    { path: 'Categories',
        component: CategoriesComponent,
        data: { animation: { value: 'Categories', } },
        canActivate: [AuthGuard]
    },
    { path: 'Cubes_List',
        component: CubesListComponent,
        data: { animation: { value: 'Cubes_List', } },
        canActivate: [AuthGuard]
    },
    { path: 'Cube_Posts',
        component: FeedsMainComponent,
        data: { animation: { value: 'Cube_Posts', } },
        canActivate: [AuthGuard]
    }
];


@NgModule({
    declarations: [ ],
    imports: [ RouterModule.forRoot(appRoutes,
        { enableTracing: true }
      )],
    providers: [],
    bootstrap: []
  })
  export class AppRoutingModule { }
