import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from "rxjs";
import { HtmlAstPath } from '@angular/compiler';
import { AuthData } from '../auth-data.model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  constructor(private authService:AuthService) { }
  private authStatusSub: Subscription;
  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }
  isLoading = false;
  signUp(form:NgForm){
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    const authData: AuthData = { email: form.value.email,fullName:form.value.fullName,userName:form.value.userName,profile:"assets/images/default.png", password: form.value.password};
    this.authService.createUser(authData);
  }
}
