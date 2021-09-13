import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { EditComponent } from '../edit/edit.component';
import { PostsService } from '../services/posts.service';
import { posts, myPosts } from '../models/posts.model';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommentsComponent } from '../main/comments/comments.component';


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
  loadPost:number;
  likesValue:string;
  currentComments:string ;
  commentValue: any;
  value: string;
  loadButton:boolean;
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
    this.loadPost = 10;
    this.postsService.getPost(this.loadPost);

    setTimeout(() => {
      this.allPosts = posts.postArray
      console.log("length ::", this.allPosts.length)
    }, 1000);
    this.postsService.commentChanged.subscribe(newComment => {
      this.commentUp(newComment.value, newComment.postId);
    })
    this.postsService.likeChanged.subscribe(newLike => {
      this.like(newLike.postId);
    })
  }

  like(postId: any) {
    console.log("this.allPosts.length", this.allPosts.length);
    console.log("postId", postId);

    for (let i = 0; i < this.allPosts.length; i++) {
    console.log("this.allPosts[i].comments.length",this.allPosts[i].like.length);

      if (this.allPosts[i]._id == postId) {
        if(this.allPosts[i].like.includes(this.userName)) {
          this.allPosts[i].like.splice(this.allPosts[i].like.indexOf(this.userName), 1);
        } else {
          this.allPosts[i].like.push(this.userName);
        }
        this.likesValue = this.allPosts[i].like;
         console.log("this.allPosts[i].comments.length",this.allPosts[i].like.length);
        break;
      }
    }
    this.postsService.updatePost(postId, this.likesValue);
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
  url: any
  
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

  editProfile() {
    const dialogRef = this.dialog.open(EditComponent, {
      width: '250px',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.isLoading = false;
    });
  }
}