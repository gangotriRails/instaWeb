import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as $ from 'jquery';
import { PostsService } from 'src/app/services/posts.service';


@Component({
  selector: 'app-post-dialog',
  templateUrl: './post-dialog.component.html',
  styleUrls: ['./post-dialog.component.css']
})
export class PostDialogComponent implements OnInit {

  constructor(private postService:PostsService) { }

  ngOnInit(): void {
    $("#postImg").hide();
  }
  url:any;
  onSelectFile(event:any) {
    $("#postImg").show();
    console.log("selection Image")
    if (event.target.files && event.target.files[0]) {
      var reader:any = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event:any) => { // called once readAsDataURL is completed
        this.url = event.target.result;
      }
      console.log("url : ",this.url)
    }
  }
  postUp(form:NgForm){
    console.log("url : ",this.url)
    // this.postService.post(userName,profileImg,postImg,caption);
  }
}
