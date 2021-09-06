import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { posts } from 'src/app/models/posts.model';
import { PostsService } from 'src/app/services/posts.service';
import { DialogData, MainComponent } from '../main.component';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  public allPosts: any = [];
  allPostsUser: any;
  allPostsProfileUrl: any;
  allPostsUrl: any;
  allPostsTimeStamp: any;
  allPostsCaption: any;
  userIsAuthenticated = false;
  userName: string;
  userEmail: string;
  fullName: string;
  authListenerSubs: any;
  commentValue: any;
  likesValue:any
  constructor(public dialogRef: MatDialogRef<CommentsComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog, public authService: AuthService, private postsService: PostsService, private router: Router, private changeDetection: ChangeDetectorRef) { }
  value: any;
  comments: any = [];
  ngOnInit(): void {
    // console.log("data", this.data.comments);
    this.comments = this.data.comments
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

      setTimeout(() => {
        this.allPosts = posts.postArray;
      }, 2000)

  }
  commentUp(value: any) {
    this.postsService.updatePostRealTime(this.data.postId, value);
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
    // this.postsService.updatePost(postId, this.likesValue);
  }

}
