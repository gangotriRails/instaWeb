import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from "rxjs";
import { LogInData } from '../auth-data.model';
import { AuthService } from "../auth.service";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  
  constructor(public authService: AuthService) { }
  isLoading :any = false;
   private authStatusSub: Subscription


  ngOnInit(): void {

    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    )
  }

  

 
  onLogin(form:NgForm){
  console.log("logging In ",form.value.email);
  if (form.invalid) {
    return;
  }
  this.isLoading = true;
  const logInData: LogInData = { email: form.value.email, password: form.value.password };
  this.authService.login(logInData);
}
}
