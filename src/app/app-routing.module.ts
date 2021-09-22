import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { EditComponent } from './edit/edit.component';
import { MainComponent } from './main/main.component'
import { PostComponent } from './main/post/post.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'login',component:LoginComponent   },
  { path: 'signup',component:SignUpComponent  },
  { path: 'main', component: MainComponent ,canActivate: [AuthGuard]  },
  { path: 'profile',component:ProfileComponent  ,canActivate: [AuthGuard] },
  { path: 'edit',component:EditComponent  ,canActivate: [AuthGuard] },
  { path: 'post',component:PostComponent  ,canActivate: [AuthGuard] },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)}

];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
