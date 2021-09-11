import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule} from '@angular/material/card'
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatButtonModule} from '@angular/material/button'
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AuthInterceptor } from "./auth/auth-interceptor";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import {MatIconModule } from '@angular/material/icon'
import {MatMenuModule} from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HeaderComponent } from './header/header.component';
import { ProfileComponent } from './profile/profile.component';
import { EditComponent } from './edit/edit.component';
import { PostDialogComponent } from './main/post-dialog/post-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CommentsComponent } from './main/comments/comments.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    SignUpComponent,
    HeaderComponent,
    ProfileComponent,
    EditComponent,
    PostDialogComponent,
    CommentsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatSliderModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule,

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
