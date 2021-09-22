import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { EditComponent } from '../edit/edit.component';
import { PostsService } from '../services/posts.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommentsComponent } from '../main/comments/comments.component';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(private zone: NgZone, public dialog: MatDialog, public authService: AuthService, private postsService: PostsService, private router: Router) { }
  userIsAuthenticated = false;
  userName: string;
  userEmail: string;
  fullName: string;
  isLoading: boolean;
  url: string
  allPosts: any[] = []
  posts: any[] = []
  loadPost: number;
  value: string;
  loadButton: boolean;

  ngOnInit(): void {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userName = this.authService.getUserName();
    this.userEmail = this.authService.getUserEmail();
    var authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userName = this.authService.getUserName();
        this.fullName = "hi"
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
    this.loadPost = 10;
    this.postsService.getPost(this.loadPost).then(res => {
      this.posts = res['postList']
      for (let i = 0; i < this.posts.length; i++) {
        if (this.posts[i].name == this.userName) {
          this.allPosts.push(this.posts[i])
          console.log("posts :::: ", this.allPosts)

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

  openCommentDialog(postId: any) {
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

  editProfile() {
    const dialogRef = this.dialog.open(EditComponent, {
      width: '250px',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.isLoading = false;
      this.authService.logout();

    });
  }
}