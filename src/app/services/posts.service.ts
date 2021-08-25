import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PouchService } from './pouch.service';
import { users,EditData } from '../models/posts.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  POSTS_BACKEND_URL:any;
  userList:any;
  USERS_BACKEND_URL:any;
  DOCUMENT_BACKEND_URL:any;
  EDIT_BACKEND_URL:any;
  constructor(@Inject(DOCUMENT) private document: Document,private router: Router, private http: HttpClient, private route: ActivatedRoute, private authService: AuthService, private pouchService: PouchService) { 
  this.POSTS_BACKEND_URL = this.authService.BACKEND_URL + "/api/posts/";
  console.log("posts backend url : ",this.POSTS_BACKEND_URL);

  this.DOCUMENT_BACKEND_URL = this.document.location.origin;
  this.USERS_BACKEND_URL = this.DOCUMENT_BACKEND_URL + "/api/usersList";
  console.log("USERS_BACKEND_URL" + this.USERS_BACKEND_URL);
  this.EDIT_BACKEND_URL = this.DOCUMENT_BACKEND_URL + "/api/edit";
  console.log("posts backend url : ",this.EDIT_BACKEND_URL);
  }

  postImage(){
    console.log("posting a post");
    
  }
  editProfile(userName:string,url:any,email:string,bio:string,phoneNumber:string,gender:string,password:string){
    console.log("edting profile in service");
    const editData: EditData = {userName:userName, url:url, email: email,bio:bio,phoneNumber:phoneNumber,gender:gender, password: password};
    this.http.post< {message:string}>(this.EDIT_BACKEND_URL, editData).subscribe(
      async (response) => {
        console.log("Response",response)
        this.router.navigate(["/profile"]);
      }
    );
  }
  getUsers() {
    console.log("getting users list");
    users.userArray.splice(0,users.userArray.length)
    this.http.get<{ userlist: any }>
      (this.USERS_BACKEND_URL).subscribe(response => {
        console.log("response on get DB", response);
        console.log("response on get DB", response.userlist);
        this.userList = response.userlist;
        console.log("username list",this.userList.length)
        for(let i=0;i<  this.userList.length;i++){
          console.log("user 1 :",this.userList[i]);
          var assignName = this.userList[i];
          var userName = new users(assignName);
      users.userArray.push(userName);
        }
      });
   }
   post(userName:any,profileImg:any,postImg:any,caption:any){
     
   }

}
