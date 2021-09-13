import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PostsService } from '../services/posts.service';
import { posts, users } from '../models/posts.model'
// import { MatDialog } from '@angular/material/dialog/dialog';
import { PostDialogComponent } from './post-dialog/post-dialog.component';
// import { MatDialog } from '@angular/material/dialog/public-api';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as $ from 'jquery';
import { NgForm } from '@angular/forms';
import { CommentsComponent } from './comments/comments.component';

export interface DialogData {
  postId: any
  comments: any
  PostsUser: any;
  PostsProfileUrl: any;
  PostsUrl: any;
  PostsTimeStamp: any;
  PostsCaption: any;
  PostsLike:any;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public dialog: MatDialog, public authService: AuthService, private postsService: PostsService, private router: Router, private changeDetection: ChangeDetectorRef) { }
  userIsAuthenticated = false;
  userName: string;
  userEmail: string;
  fullName: string;
  authListenerSubs: any;
  isLoading: boolean;
  isLoadingfromServer: any;
  url: any
  public allUsers: any = [];
  allUserName: any;
  allUserUrl: any;
  allUserFullName: any;
  public allPosts: any = [];
  allPostsUser: any;
  allPostsProfileUrl: any;
  allPostsUrl: any;
  allPostsTimeStamp: any;
  allPostsCaption: any;
  likeCount: any;
  value: any;
  commentsLength: any;
  commentValue: any;
  likesValue:any;
  currentComments: any;
  likesArray:any;
  isLiked:boolean;
  loadPost:number ;
  loadButton:boolean = false;
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
      });
    this.isLoadingfromServer = true;
    this.postsService.getUsers();
    this.url = this.authService.getProfile();
    this.loadPost = 10
    this.postsService.getPost(this.loadPost);

    setTimeout(() => {
      this.allUsers = users.userArray
      for (let i = 0; i < this.allUsers.length; i++) {
        this.allUserName = this.allUsers[i].userName;
        this.allUserUrl = this.allUsers[i].userProfile;
        this.allUserFullName = this.allUsers[i].userFullName;
      }
    }, 1000)

    setTimeout(() => {
      this.allPosts = posts.postArray;
      console.log("post length initially :: ",this.allPosts.length);
      if(this.loadPost <= this.allPosts.length){
        this.loadButton = true;
      }
    }, 2000)

    this.postsService.commentChanged.subscribe(newComment => {
      this.commentUp(newComment.value, newComment.postId);
    })
    this.postsService.likeChanged.subscribe(newLike => {
      this.like(newLike.postId);
    })
  }
  loadMorePosts(){
    console.log("loadPost before :",this.loadPost)
    if(this.loadPost <= posts.postArray.length){ 
    this.loadPost = this.loadPost + 10
    console.log("this.loadPost after :",this.loadPost)
    this.postsService.getPost(this.loadPost);
    setTimeout(() => {
      this.allPosts = posts.postArray;
    console.log("post length on load more :: ",this.allPosts.length);
    this.loadButton = true
    }, 2000)
  }else if(this.loadPost > posts.postArray.length){
    this.loadButton = false;
    console.log("loadButton",this.loadButton)
  }
  }
  like(postId: any) {
    console.log("this.allPosts.length", this.allPosts.length);
    console.log("postId", postId);

    for (let i = 0; i < this.allPosts.length; i++) {
    console.log("this.allPosts[i].comments.length",this.allPosts[i].like.length);

      if (this.allPosts[i]._id == postId) {
        if(this.allPosts[i].like.includes(this.userName)) {
          this.allPosts[i].like.splice(this.allPosts[i].like.indexOf(this.userName), 1);
          $("#"+this.allPosts[i]._id).addClass("likeButton1");
          $("#"+this.allPosts[i]._id).removeClass("likeButton");

        } else {
          this.allPosts[i].like.push(this.userName);
          $("#"+this.allPosts[i]._id).addClass("likeButton")
          $("#"+this.allPosts[i]._id).removeClass("likeButton1");

        }
        this.likesValue = this.allPosts[i].like;
         console.log("this.allPosts[i].comments.length",this.allPosts[i].like.length);
        break;
      }
    }
    this.postsService.updatePost(postId, this.likesValue);
  }


  commentUp(value: any, postId: any) {
    this.commentValue = {
      userName: this.userName,
      newComment: value
    };
    for (let i = 0; i < this.allPosts.length; i++) {
      if (this.allPosts[i]._id == postId) {
        this.allPosts[i].comments.push(this.commentValue);
        break;
      }
    }
    this.postsService.updatePostComment(postId, this.commentValue);
    this.value =""
  }
  toggle = true;
  status = 'Enable';

  enableDisableRule() {
    this.toggle = !this.toggle;
    this.status = this.toggle ? 'Enable' : 'Disable';
  }

  openComment(postId: any) {
    for (let i = 0; i <= this.allPosts.length; i++) {
      if (this.allPosts[i]._id == postId) {
        this.currentComments = this.allPosts[i].comments;
        var PostsUser = this.allPosts[i].userName
        var PostsProfileUrl = this.allPosts[i].profileUrl
        var PostsUrl = this.allPosts[i].postUrl
        var PostsTimeStamp = this.allPosts[i].timeStamp
        var PostsCaption = this.allPosts[i].caption
        var PostsLike = this.allPosts[i].like
        break;
      }
    }
    const dialogRef = this.dialog.open(CommentsComponent, {
      width: '1000px',
      data: { postId: postId,
              comments: this.currentComments,
              PostsUser: PostsUser,
              PostsProfileUrl:PostsProfileUrl ,
              PostsUrl: PostsUrl,
              PostsTimeStamp: PostsTimeStamp,
              PostsCaption: PostsCaption,
              PostsLike : PostsLike
            }
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }


  addPost() {
    const dialogRef = this.dialog.open(PostDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
