import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { AuthService } from 'src/app/auth/auth.service';
import { PostsService } from 'src/app/services/posts.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  constructor(private authService: AuthService, private postsService: PostsService, private router: ActivatedRoute) { }
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

 async ngOnInit() {
    var postName = this.router.snapshot.queryParams['postId'];
    this.loadPost = 10;
     this.postsService.getPost(this.loadPost).then(res => {
       this.post = res['postList']
       for (let i = 0; i < this.post.length; i++) {
        if (postName == this.post[i]._id) {
          this.isPost = true
          console.log("length ::", this.post[i])
          this.postUrl = this.post[i].postUrl;
          this.timeStamp = this.post[i].timeStamp;
          this.caption = this.post[i].caption;
          this.likes = this.post[i].like;
          this.comments = this.post[i].comments;
          this.profileUrl = this.post[i].profileUrl;
          this.userName = this.post[i].name
        }
      }
     })

  }
}

