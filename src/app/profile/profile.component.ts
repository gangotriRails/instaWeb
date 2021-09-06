import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { EditComponent } from '../edit/edit.component';
import { PostsService } from '../services/posts.service';
import { posts, myPosts } from '../models/posts.model';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(public dialog: MatDialog, public authService: AuthService, private postsService: PostsService, private router: Router) { }
  userIsAuthenticated = false;
  userName: string;
  userEmail: string;
  fullName: string;
  authListenerSubs: any;
  isLoading: boolean;
  isLoadingfromServer: any;
  public allPosts: any = [];
  allPostsUser: any;
  allPostsProfileUrl: any;
  allPostsUrl: any;
  allPostsTimeStamp: any;
  allPostsCaption: any;
  likeCount: any = 0;
  myPosts:any

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

    this.isLoadingfromServer = true;
    var profile = this.authService.getProfile();
    this.url = profile;
    this.postsService.getPost();

    setTimeout(() => {
      this.allPosts = myPosts.myPostArray
      for (let i = 0; i < posts.postArray.length; i++) {
      
        this.allPostsUser = this.allPosts[i].userName
        this.allPostsProfileUrl = this.allPosts[i].profileUrl
        this.allPostsUrl = this.allPosts[i].postUrl
        this.allPostsTimeStamp = this.allPosts[i].timeStamp
        this.allPostsCaption = this.allPosts[i].caption
      }
    }, 1000)
  }

  like(name: any) {

  }

  url: any
  viewProfile() {
    this.router.navigate(["/profile"]);
  }
  onLogout() {
    this.authService.logout();
  }
  addPost() {
  }

  editProfile() {
    const dialogRef = this.dialog.open(EditComponent, {
      width: '250px',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.isLoading = false;
    });
  }
}