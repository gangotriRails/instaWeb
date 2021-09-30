import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute,Router } from "@angular/router";
import { AuthService } from 'src/app/auth/auth.service';
import { PostsService } from 'src/app/services/posts.service';
import { EditPostComponent } from '../edit-post/edit-post.component';
export interface editDialogData {
  PostsUrl: string;
  PostsCaption: string;
}
@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  constructor(public dialog: MatDialog,private authService: AuthService, private activatedRouter:ActivatedRoute ,private postsService: PostsService, private router: Router) { }
  userName:string
  loadPost: number;
  postUrl: string;
  timeStamp: string;
  caption: string;
  likes: string[];
  comments: string[];
  profileUrl: string;
  value: string
  post:any[];
  isPost :boolean = false
  userEmail:string
  id:any;

 async ngOnInit() {
    this.id = this.activatedRouter.snapshot.queryParams['postId']
    this.postsService.getPostById(this.id).then(res => {
   console.log("res :::::::" ,res)
   this.post = res['postList']
      this.isPost = true
      console.log("length ::", this.post[0])
      this.postUrl = this.post[0].postUrl;
      this.timeStamp = this.post[0].date + " " +this.post[0].time;
      this.caption = this.post[0].caption;
      this.likes = this.post[0].like;
      this.comments = this.post[0].comments;
      this.profileUrl = this.post[0].profileUrl;
      this.userName = this.post[0].name;
      this.userEmail = this.post[0].email
    })
  }
  editPost(){
    const dialogRef = this.dialog.open(EditPostComponent, {
      width: '500px',
      data: {
        PostsUrl: this.postUrl,
        PostsCaption: this.caption,
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      let editPostData = new FormData();
      editPostData.append('postImg', result.postImg);
      editPostData.append('caption', result.caption);
      editPostData.append('email', this.userEmail);
      editPostData.append('id',this.id)
      console.log("postImg :",result.postImg)
      this.postsService.editPost(editPostData).then(
        (response) => {
         console.log("Response", response)
         this.postsService.getPostById(this.id).then(res => {
          console.log("res :::::::" ,res)
          this.post = res['postList']
             this.isPost = true
             console.log("length ::", this.post[0])
             this.postUrl = this.post[0].postUrl;
             this.timeStamp = this.post[0].date + " " +this.post[0].time;
             this.caption = this.post[0].caption;
             this.likes = this.post[0].like;
             this.comments = this.post[0].comments;
             this.profileUrl = this.post[0].profileUrl;
             this.userName = this.post[0].name;
             this.userEmail = this.post[0].email
           })
        //  this.router.navigate(["/main"])
       }
     );
    });
  }
  deletePost(){
    const dialogRef = this.dialog.open(confirmationDeleteDialog, {
      disableClose: true,
      width: '450px',
      panelClass: 'my-dialog',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (`${result}` == "true") {
        this.postsService.deletePost(this.id).then(res => {
          console.log("res :",res)
         this.router.navigate(["/main"])
        })
      }
    });
    
  }
}

@Component({
  selector: 'confirmationDelete-dialog',
  templateUrl: './confirmationDelete.dialog.html',
  styleUrls: ['./post.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class confirmationDeleteDialog implements OnInit {

  constructor() { }


  ngOnInit(): void {

  }


}