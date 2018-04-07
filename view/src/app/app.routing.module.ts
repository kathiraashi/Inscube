import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

// Default
    import { LoginComponent } from './login/login.component';
    import { ProfileCompletionComponent } from './profile-completion/profile-completion.component';
    import { CategoriesComponent } from './categories/categories.component';
    import { CubesListComponent } from './cubes-list/cubes-list.component';

const appRoutes: Routes = [
    { path: '',
        component: LoginComponent,
        data: { animation: { value: 'Login', } }
    },
    { path: 'Profile_Completion',
        component: ProfileCompletionComponent,
        data: { animation: { value: 'Profile_Completion', } }
    },
    { path: 'Categories',
        component: CategoriesComponent,
        data: { animation: { value: 'Categories', } }
    },
    { path: 'Cubes_List',
        component: CubesListComponent,
        data: { animation: { value: 'Cubes_List', } }
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
