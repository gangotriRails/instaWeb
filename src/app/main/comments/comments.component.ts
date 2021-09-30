import { ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
// import { posts } from 'src/app/models/posts.model';
import { PostsService } from 'src/app/services/posts.service';
import { DialogData, MainComponent } from '../main.component';
import { confirmationDeleteDialog } from '../post/post.component';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  allPosts: any;
  userIsAuthenticated = false;

  userName: string;
  userEmail: string;
  fullName: string;
  value: string;
  comments: any[]=[];
  loadComment: number;
  loadButton: boolean = false
  constructor(public dialogRef: MatDialogRef<CommentsComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, public dialog: MatDialog, public authService: AuthService, private postsService: PostsService, private router: Router, private changeDetection: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.postsService.getComments(10,this.data.postId).then( res => {
      this.comments = res['commentsList']
    })
    this.loadComment = 10;
  }
  deleteComment(commentId:string){
    console.log("comment id :",commentId)
    // const dialogRef = this.dialog.open(confirmationCommentDeleteDialog, {
    //   disableClose: true,
    //   width: '450px',
    //   panelClass: 'my-dialog',
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (`${result}` == "true") {
        this.postsService.deleteComment(commentId,this.data.postId).then(res => {
          console.log("res :",res)
          this.postsService.getComments(10,this.data.postId).then( res => {
            this.comments = res['commentsList']
          })
        //  this.router.navigate(["/main"])
        })
    //   }
    // });
    
  }
  // loadMoreComments() {
  //   if (this.loadComment <= this.data.comments.length) {
  //     this.loadButton = true
  //     this.comments = this.data.comments.slice(0, this.loadComment + 10)
  //     this.loadComment += 10;
  //   } else if (this.loadComment > this.data.comments.length) {
  //     this.loadButton = false
  //   }
  // }
  commentUp(value: string) {
    this.postsService.updatePostRealTime(this.data.postId, value);
    this.dialogRef.close();
  }

}

@Component({
  selector: 'confirmationDelete-dialog',
  templateUrl: './confirmationCommentDelete.dialog.html',
  styleUrls: ['./comments.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class confirmationCommentDeleteDialog implements OnInit {

  constructor() { }


  ngOnInit(): void {

  }


}