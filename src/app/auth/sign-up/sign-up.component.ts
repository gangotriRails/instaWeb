import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from "rxjs";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  constructor(private authService:AuthService) { }
  private authStatusSub: Subscription;


  ngOnInit(): void {
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
    // console.log("signing Up")
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.fullName,form.value.userName,form.value.password);

  }
}
