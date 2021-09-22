import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import * as $ from 'jquery';
import { AuthService } from 'src/app/auth/auth.service';
import { PostsService } from 'src/app/services/posts.service';


@Component({
  selector: 'app-post-dialog',
  templateUrl: './post-dialog.component.html',
  styleUrls: ['./post-dialog.component.css']
})
export class PostDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PostDialogComponent>, private postService: PostsService, public authService: AuthService,) { }
  userIsAuthenticated = false;
  userName: string;
  userEmail: string;
  fullName: string;

  profileImg: string;
  postImg: string;


  ngOnInit(): void {
    $("#postImg").hide();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userName = this.authService.getUserName();
    this.userEmail = this.authService.getUserEmail();
    // this.fullName = "hi"
    var authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userName = this.authService.getUserName();
        this.fullName = "Hi"
      });
    // this.profileImg = "assets/images/default.png"
    this.postService.getUsers().then(res => {
      var allUsers :any[] = [];
      allUsers = res['userList']
      console.log("userList : ", res['userList'])
      for(let i=0;i< allUsers.length;i++){
        console.log("No :",i,"User :",allUsers[i].userName)
        console.log("userName :",this.userName)
        if(allUsers[i].userName == this.userName){
          this.fullName = allUsers[i].fullName;
          this.profileImg = allUsers[i].profile
          console.log("fullName :",this.fullName);
          console.log("profile : ",this.profileImg)
        }
      }
    })
  }

  onSelectFile(event: any) {
    $("#postImg").show();
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.postImg = event.target.result;
      }
    }
  }

  addPost(form: NgForm) {
    var today = new Date();
    var date = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0')
      + '/' + today.getFullYear();
    var currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit", hour12: false })
    var timestamp = date + " (" + currentTime + ") "
    let postData = new FormData();
    postData.append('userName', this.userName);
    postData.append('profileImg', this.profileImg);
    postData.append('postImg', this.postImg);
    postData.append('caption', form.value.caption);
    postData.append('timestamp', timestamp)
    this.postService.post(postData);
    this.dialogRef.close();
  }
}
