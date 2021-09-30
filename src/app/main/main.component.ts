import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PostsService } from '../services/posts.service';
import { PostDialogComponent } from './post-dialog/post-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CommentsComponent } from './comments/comments.component';
import { JwtHelperService } from '@auth0/angular-jwt';
import { v4 as uuid } from 'uuid';

export interface DialogData {
  postId: string
  comments: []
  PostsUser: string;
  PostsProfileUrl: string;
  PostsUrl: string;
  PostsTimeStamp: string;
  PostsCaption: string;
  PostsLike: [];
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {

  constructor(private zone: NgZone, public dialog: MatDialog, public authService: AuthService, private postsService: PostsService, private router: Router) { }


  loadPost: number;
  loadButton: boolean = false;
  allUsers: any[] = []
  allPosts: any;
  value: string;
  userIsAuthenticated = false;
  userName: string;
  userEmail: string;
  fullName: string;
  isLoading: boolean;
  isLoadingfromServer: boolean;
  url: string


  ngOnInit(): void {
    this.userIsAuthenticated = this.authService.getIsAuth();
    var authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
    const token = this.authService.getToken();
    const helper = new JwtHelperService();
    const decoded = helper.decodeToken(token);
    console.log("emial :: ", decoded)
    this.userEmail = decoded.userId.slice(17, decoded.length)
    console.log("user email :", this.userEmail)
    this.loadPost = 10
    this.postsService.getPost(this.loadPost).then(res => {
      this.allPosts = res['postList']
      console.log("all posts", this.allPosts)
    })
    this.postsService.getUsers().then(res => {
      this.allUsers = res['userList']
      for (let i = 0; i < this.allUsers.length; i++) {
        if (this.allUsers[i].name == this.userEmail) {
          this.fullName = this.allUsers[i].fullName;
          this.url = this.allUsers[i].profile;
          this.userName = this.allUsers[i].userName;
        }
      }
    })
    this.postsService.commentChanged.subscribe(newComment => {
      this.commentUp(newComment.value, newComment.postId);
    })
    this.postsService.likeChanged.subscribe(newLike => {
      this.like(newLike.postId);
    })
  }

  loadMorePosts() {
    if (this.loadPost <= this.allPosts.length) {
      this.loadButton = true;
      this.loadPost = this.loadPost + 10
      this.postsService.getPost(this.loadPost).then(res => {
        this.allPosts = res['postList']
      })
    } else if (this.loadPost > this.allPosts.length) {
      this.loadButton = false;
    }
  }

  like(postId: string) {
    for (let i = 0; i < this.allPosts.length; i++) {
      if (this.allPosts[i]._id == postId) {
        if (this.allPosts[i].like.includes(this.userName)) {
          this.allPosts[i].like.splice(this.allPosts[i].like.indexOf(this.userName), 1);
        } else {
          this.allPosts[i].like.push(this.userName);
        }
        var likesValue = this.allPosts[i].like;
        break;
      }
    }
    let postDetail = {
      postId: postId,
      newLike: likesValue
    }
    this.postsService.updatePost(postDetail);
  }


  commentUp(value: string, postId: string) {
    var today = new Date();
    var date = String(today.getDate()).padStart(2, '0') + '-' + String(today.getMonth() + 1).padStart(2, '0')
      + '-' + today.getFullYear();
    var time = new Date();
    var currentTime = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: '2-digit', hour12: true })
    var id = uuid();
    var commentValue = {
      userName: this.userName,
      newComment: value,
      date: date,
      time: currentTime,
      id: id,
    };
    for (let i = 0; i < this.allPosts.length; i++) {
      if (this.allPosts[i]._id == postId) {
        this.allPosts[i].comments.push(commentValue);
        break;
      }
    }
    let postDetail = {

      postId: postId,
      newComment: commentValue,

    }
    this.postsService.updatePost(postDetail);
    this.value = ""
  }

  openCommentDialog(postId: string) {
    for (let i = 0; i <= this.allPosts.length; i++) {
      if (this.allPosts[i]._id == postId) {
        var currentComments = this.allPosts[i].comments;
        var PostsUser = this.allPosts[i].userName
        var PostsProfileUrl = this.allPosts[i].profileUrl
        var PostsUrl = this.allPosts[i].postUrl
        var PostsTimeStamp = this.allPosts[i].date + this.allPosts[i].time
        var PostsCaption = this.allPosts[i].caption
        var PostsLike = this.allPosts[i].like
        break;
      }
    }
    const dialogRef = this.dialog.open(CommentsComponent, {
      width: '1000px',
      data: {
        postId: postId,
        comments: currentComments,
        PostsUser: PostsUser,
        PostsProfileUrl: PostsProfileUrl,
        PostsUrl: PostsUrl,
        PostsTimeStamp: PostsTimeStamp,
        PostsCaption: PostsCaption,
        PostsLike: PostsLike
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      this.postsService.getPost(this.loadPost).then(res => {
        this.allPosts = res['postList']
        console.log("all posts", this.allPosts)
      })
    })
  }

  navToPosts(postId: string) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "postId": postId,
      }
    }
    this.zone.run(() => {
      this.router.navigate(["/post"], navigationExtras);
    });
  }

  addPost() {
    const dialogRef = this.dialog.open(PostDialogComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(result => {
      let postData = new FormData();
      postData.append('userName', this.userName);
      postData.append('profileImg', this.url);
      postData.append('postImg', result.postImg);
      postData.append('caption', result.caption);
      postData.append('email', this.userEmail)
      console.log("caption :", result.caption)
      console.log("userName :", this.userName)
      this.postsService.post(postData, this.userEmail).then((response: any) => {
        console.log("id :", response._id)
        this.loadPost = 10;
        this.postsService.getPost(this.loadPost).then(res => {
          this.allPosts = res['postList']
          console.log("all posts", this.allPosts)
        })
      })
    });
  }

}
