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
  // isLoading: boolean;
  // isLoadingfromServer: any;

  ngOnInit(): void {
    this.userIsAuthenticated = this.authService.getIsAuth();
    console.log("this.userIsAuthenticated", this.userIsAuthenticated)
    this.userName = this.authService.getUserName();
    console.log("this.userName", this.userName);
    this.userEmail = this.authService.getUserEmail();
    console.log("UserEmail", this.userEmail);
    this.fullName = this.authService.getUserFullName();
    console.log("fullName", this.fullName)
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userName = this.authService.getUserName();
        this.fullName = this.authService.getUserFullName();
      });

    // this.isLoadingfromServer = true;
    var profile = this.authService.getProfile();
    console.log("++++++++++++++++++", profile)
    if (profile == "null") {
      this.url = 'assets/images/default.png';
    }
    console.log("url : ", this.url)
  }
  url: any
  viewProfile() {
    console.log("view profile")
    this.router.navigate(["/profile"]);
  }
  onSelectFile(event:any) {
    console.log("selection Image")
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { // called once readAsDataURL is completed
        this.url = event.target?.result;
      }
      console.log("url : ",this.url)
    }
  }
  onLogout() {
    this.authService.logout();
  }
  editForm(form: NgForm) {
    console.log("edit Page")
    console.log("+++++++++++++++++++++", this.url);
    if (form.invalid) {
      return;
    }
    console.log("url",this.url)
    console.log("signing Up")
    // this.isLoading = true;
    console.log("bio :", form.value.Bio)
   this.postsService.editProfile(this.userName ,this.url,form.value.email, form.value.Bio, form.value.phoneNumber, form.value.gender,form.value.password);

  }

}
