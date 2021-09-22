import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PostsService } from '../services/posts.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<EditComponent>, public authService: AuthService, private postsService: PostsService) { }
  userIsAuthenticated = false;
  userName: string;
  userEmail: string;
  fullName: string;
  url: string


  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userName = this.authService.getUserName();
    this.userEmail = this.authService.getUserEmail();
    var authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userName = this.authService.getUserName();
      });
      this.postsService.getUsers().then(res => {
        var allUsers :any[] = [];
        allUsers = res['userList']
        console.log("userList : ", res['userList'])
        for(let i=0;i< allUsers.length;i++){
          console.log("No :",i,"User :",allUsers[i].userName)
          console.log("userName :",this.userName)
          if(allUsers[i].userName == this.userName){
            this.fullName = allUsers[i].fullName;
            this.url = allUsers[i].profile
            console.log("fullName :",this.fullName);
            console.log("profile : ",this.url)
          }
        }
      })

  }

  onSelectFile(event: any) {
    console.log(event)
    if (event.target.files && event.target.files[0]) {
      var reader: FileReader;
      reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.url = event.target.result;
      }
    }
  }

  editForm(form: NgForm) {
    if (form.invalid) {
      return;
    }
    let editData = new FormData();
    editData.append('userName', this.userName);
    editData.append('url', this.url);
    editData.append('email', form.value.email);
    editData.append('bio', form.value.Bio);
    editData.append('phoneNumber', form.value.phoneNumber);
    editData.append('gender', form.value.gender);
    editData.append('password', form.value.password);
    this.postsService.editProfile(editData);
    this.dialogRef.close();
  }
}
