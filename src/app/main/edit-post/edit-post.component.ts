import { Component, Inject, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as $ from 'jquery';
import { editDialogData } from '../post/post.component';


@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<EditPostComponent>, @Inject(MAT_DIALOG_DATA) public data: editDialogData) { }
  postImg:string;
  onSelectFile(event: any) {
    $("#postImg").show();
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.postImg = event.target.result;
      }
    }
  }
  ngOnInit(): void {
    this.postImg = this.data.PostsUrl;

  }

  addPost(form: NgForm) {
    this.dialogRef.close({caption:form.value.caption,postImg:this.postImg});
  }
}
