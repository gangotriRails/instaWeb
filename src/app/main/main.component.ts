import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PostsService } from '../services/posts.service';
import { users } from '../models/posts.model'
import { MatDialog } from '@angular/material/dialog';
import { PostDialogComponent } from './post-dialog/post-dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public dialog: MatDialog,public authService: AuthService,private postsService:PostsService, private router: Router) { }
  userIsAuthenticated = false;
  userName:string;
  userEmail:string;
  fullName:string;
  authListenerSubs:any;
  isLoading:boolean;
  isLoadingfromServer:any;
  url:any
  allUsers :any;
  allUserName :any;
  ngOnInit(): void {
    this.userIsAuthenticated = this.authService.getIsAuth();
    console.log("this.userIsAuthenticated", this.userIsAuthenticated)
    this.userName = this.authService.getUserName();
    console.log("this.userName", this.userName);
    this.userEmail = this.authService.getUserEmail();
    console.log("UserEmail",this.userEmail);
    this.fullName = this.authService.getUserFullName();
    console.log("fullName",this.fullName)
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userName = this.authService.getUserName();
      });

    this.isLoadingfromServer = true;
    this.postsService.getUsers();
    this.url = this.authService.getProfile();
    console.log(this.url)
    setTimeout(() => {
      this.allUsers = users.userArray
    console.log("users.userArray.length +++++++++ ",this.allUsers.length);
    for(let i=0;i<this.allUsers.length;i++){
      this.allUserName = this.allUsers[i].userName;
      console.log("names --------------------------",this.allUserName)
    }
  }, 1000)
    
  }
  viewProfile(){
    console.log("view profile")
    this.router.navigate(["/profile"]);
  }

  addPost(){
    console.log("adding post");
    const dialogRef = this.dialog.open(PostDialogComponent, {
      width: '250px',
      // data: {name: this.name, animal: this.animal}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.postsService.postImage();

    });
  }

  onLogout() {
    this.authService.logout();
  }
 
}
