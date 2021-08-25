import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from "rxjs";
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
  console.log("logging In ",form.value);
  if (form.invalid) {
    return;
  }
  this.isLoading = true;
  this.authService.login(form.value.userName, form.value.password);
}
}
