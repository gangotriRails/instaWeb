import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { JwtHelperService } from '@auth0/angular-jwt';
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
  userName: string;
  userEmail: string;
  fullName: string;
  userIsAuthenticated = false;
  profileImg: string;
  postImg: string;


  ngOnInit(): void {
    $("#postImg").hide();
    this.userIsAuthenticated = this.authService.getIsAuth();
    const token = this.authService.getToken();
    const helper = new JwtHelperService();
    const decoded= helper.decodeToken(token);
     console.log("emial :: ",decoded)
     this.userEmail = decoded.userId.slice(17,decoded.length)
    console.log("user email :" ,this.userEmail)
    var authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
    this.postService.getUsers().then(res => {
      var allUsers :any[] = [];
      allUsers = res['userList']
      for(let i=0;i< allUsers.length;i++){
        if(allUsers[i].name == this.userEmail){
         this.userName = allUsers[i].userName;
          this.fullName = allUsers[i].fullName;
          this.profileImg = allUsers[i].profile;
    this.userName = allUsers[i].userName
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
    this.dialogRef.close({caption:form.value.caption,postImg:this.postImg});
  }
}
