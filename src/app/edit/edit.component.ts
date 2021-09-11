import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PostsService } from '../services/posts.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  constructor(public authService: AuthService, private postsService: PostsService, private router: Router) { }
  userIsAuthenticated = false;
  userName: string;
  userEmail: string;
  fullName: string;
  authListenerSubs: any;

  ngOnInit(): void {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userName = this.authService.getUserName();
    this.userEmail = this.authService.getUserEmail();
    this.fullName = this.authService.getUserFullName();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userName = this.authService.getUserName();
        this.fullName = this.authService.getUserFullName();
      });

    var profile = this.authService.getProfile();
      this.url = profile
  }
  url: any
  
  onSelectFile(event:any) {
    if (event.target.files && event.target.files[0]) {
      var reader :any;
      reader= new FileReader();

      reader.readAsDataURL(event.target.files[0]); 

      reader.onload = (event:any) => { 
        this.url = event.target.result;
      }
    }
  }
  
  editForm(form: NgForm) {
    if (form.invalid) {
      return;
    }
    console.log("email :",form.value.email)
    console.log("bio :",form.value.bio)
    console.log("phone :",form.value.phoneNumber)
    console.log("gender :",form.value.gender)
    console.log("password :",form.value.password)
    console.log("url :",this.url)

   this.postsService.editProfile(this.userName ,this.url,form.value.email, form.value.Bio, form.value.phoneNumber, form.value.gender,form.value.password);

  }

}
