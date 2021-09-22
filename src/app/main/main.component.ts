import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PostsService } from '../services/posts.service';
import { PostDialogComponent } from './post-dialog/post-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CommentsComponent } from './comments/comments.component';

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
  allUsers:any[] = []
  // any[] = []
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
    this.userName = this.authService.getUserName();
    this.userEmail = this.authService.getUserEmail();
    // this.fullName = "hi"
    var authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userName = this.authService.getUserName();
      });
    this.isLoadingfromServer = true;
    // this.url = "assets/images/default.png"

    this.loadPost = 10
    this.postsService.getPost(this.loadPost).then(res => {
      this.allPosts = res['postList']
      console.log("all posts", this.allPosts)
    })
    this.postsService.getUsers().then(res => {
      this.allUsers = res['userList']
      console.log("userList : ", res['userList'])
      for(let i=0;i< this.allUsers.length;i++){
        console.log("No :",i,"User :",this.allUsers[i].userName)
        console.log("userName :",this.userName)
        if(this.allUsers[i].userName == this.userName){
          this.fullName = this.allUsers[i].fullName;
          this.url = this.allUsers[i].profile
          console.log("fullName :",this.fullName);
          console.log("profile : ",this.url)
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
    var commentValue = {
      userName: this.userName,
      newComment: value
    };
    for (let i = 0; i < this.allPosts.length; i++) {
      if (this.allPosts[i]._id == postId) {
        this.allPosts[i].comments.push(commentValue);
        break;
      }
    }
    let postDetail = {
      postId: postId,
      newComment: commentValue
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
        var PostsTimeStamp = this.allPosts[i].timeStamp
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

    dialogRef.afterClosed().subscribe(async result => {
      this.loadPost = 10;
      this.postsService.getPost(this.loadPost).then(res => {
        this.allPosts = res['postList']
        console.log("all posts", this.allPosts)
      })
    });
  }

}
