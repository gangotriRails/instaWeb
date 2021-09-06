import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as $ from 'jquery';
import { AuthService } from 'src/app/auth/auth.service';
import { PostsService } from 'src/app/services/posts.service';


@Component({
  selector: 'app-post-dialog',
  templateUrl: './post-dialog.component.html',
  styleUrls: ['./post-dialog.component.css']
})
export class PostDialogComponent implements OnInit {

  constructor(private postService: PostsService, public authService: AuthService,) { }
  userIsAuthenticated = false;
  userName: string;
  userEmail: string;
  fullName: string;
  authListenerSubs: any;
  isLoading: boolean;
  isLoadingfromServer: any;
  profileImg: any;
  ngOnInit(): void {
    $("#postImg").hide();
    this.userIsAuthenticated = this.authService.getIsAuth();
    // console.log("this.userIsAuthenticated", this.userIsAuthenticated)
    this.userName = this.authService.getUserName();
    // console.log("this.userName", this.userName);
    this.userEmail = this.authService.getUserEmail();
    // console.log("UserEmail", this.userEmail);
    this.fullName = this.authService.getUserFullName();
    // console.log("fullName", this.fullName)
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userName = this.authService.getUserName();
        this.fullName = this.authService.getUserFullName();
      });
    this.isLoadingfromServer = true;
    var profile = this.authService.getProfile();
    // console.log("++++++++++++++++++", profile)
    this.profileImg = profile
  }
  postImg: any;
  onSelectFile(event: any) {
    $("#postImg").show();
    // console.log("selection Image")
    if (event.target.files && event.target.files[0]) {
      var reader: any = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data postImg
      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.postImg = event.target.result;
      }
      // console.log("postImg : ", this.postImg)
    }
  }
  postUp(form: NgForm) {
    // console.log("postImg : ", this.postImg)
    // console.log("profileImg : ", this.profileImg)

    // console.log("userName : ", this.userName)
    // console.log("form.value.caption : ", form.value.caption)

    this.postService.post(this.userName, this.profileImg, this.postImg, form.value.caption);
  }
}
