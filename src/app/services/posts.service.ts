import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PouchService } from './pouch.service';
import { users, EditData, postData, posts, myPosts } from '../models/posts.model';
import { post } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  POST_BACKEND_URL: any;
  userList: any;
  USERS_BACKEND_URL: any;
  DOCUMENT_BACKEND_URL: any;
  EDIT_BACKEND_URL: any;
  today: any;
  currentTime: any;
  userQuery: any;
  postList: any;
  currentUser = this.authService.getUserName();

  commentChanged = new EventEmitter<any>();
  likeChanged = new EventEmitter<any>();

  constructor(@Inject(DOCUMENT) private document: Document, private router: Router, private http: HttpClient, private route: ActivatedRoute, private authService: AuthService, private pouchService: PouchService) {
    this.POST_BACKEND_URL = this.authService.BACKEND_URL + "/api/post";
    // // console.log("posts backend url : ", this.POST_BACKEND_URL);

    this.DOCUMENT_BACKEND_URL = this.document.location.origin;
    this.USERS_BACKEND_URL = this.DOCUMENT_BACKEND_URL + "/api/usersList";
    // // console.log("USERS_BACKEND_URL" + this.USERS_BACKEND_URL);
    this.EDIT_BACKEND_URL = this.DOCUMENT_BACKEND_URL + "/api/edit";
    // // console.log("posts backend url : ", this.EDIT_BACKEND_URL);
  }

  editProfile(userName: string, url: any, email: string, bio: string, phoneNumber: string, gender: string, password: string) {
    // // console.log("edting profile in service");
    // const editData: EditData = { userName: userName, url: url, email: email, bio: bio, phoneNumber: phoneNumber, gender: gender, password: password };
    let editData = new FormData();
    editData.append('userName', userName);
    editData.append('url', url);
    editData.append('email', email);
    editData.append('bio', bio);
    editData.append('phoneNumber', phoneNumber);
    editData.append('gender', gender);
    editData.append('password', password);


    this.http.post<{ message: string }>(this.EDIT_BACKEND_URL, editData).subscribe(
      async (response) => {
        // // console.log("Response", response)
        this.authService.logout();
        // this.router.navigate(["/profile"]);
      }
    );
  }

  getUsers() {
    // // console.log("getting users list");
    users.userArray.splice(0, users.userArray.length)
    this.http.get<{ userlist: any }>
      (this.USERS_BACKEND_URL).subscribe(response => {
        // // // console.log("response on get DB", response);
        // // // console.log("response on get DB", response.userlist);
        this.userList = response.userlist;
        // // console.log("username list", this.userList.length)
        for (let i = 0; i < this.userList.length; i++) {
          // // console.log("user "+i+" :", this.userList[i]);
          var assignName = this.userList[i].userName;
          // // console.log("userName"+i+":",assignName)
          var userProfile = this.userList[i].profile
          // // console.log("userProfile"+i+":",userProfile)
          var userFullName = this.userList[i].fullName
          var userName = new users(assignName, userProfile, userFullName);
          users.userArray.push(userName);
        }
      });
  }

  post(userName: any, profileImg: any, postImg: any, caption: any) {

    this.userQuery = `?userName=${userName}`;
    this.today = new Date();
    var dd = String(this.today.getDate()).padStart(2, '0');
    var mm = String(this.today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = this.today.getFullYear();

    this.today = mm + '/' + dd + '/' + yyyy;
    this.currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit", hour12: false })
    var timestamp = this.today + " (" + this.currentTime + ") "
    let postData = new FormData();
    postData.append('userName', userName);
    postData.append('profileImg', profileImg);
    postData.append('postImg', postImg);
    postData.append('caption', caption);
    postData.append('timestamp', timestamp)
    this.http.post<{ message: string, _id: any }>
      (this.POST_BACKEND_URL + this.userQuery, postData).subscribe(
        async (response) => {
          // console.log(response);
          var postDetails = new posts(response._id, userName, profileImg, postImg, timestamp, 0, [], caption);
          posts.postArray.unshift(postDetails);
        }
      );
  }

  getPost() {
    // // console.log("getting posts");
    posts.postArray.splice(0, posts.postArray.length)
    myPosts.myPostArray.splice(0, myPosts.myPostArray.length)


    this.http.get<{ postList: any }>
      (this.POST_BACKEND_URL).subscribe(response => {
        console.log("response on get DB", response.postList);
        this.postList = response.postList;
        for (let i = 0; i < this.postList.length; i++) {
          var _id = this.postList[i]._id;
          var userName = this.postList[i].name;
          var profileUrl = this.postList[i].profileUrl;
          var postUrl = this.postList[i].postUrl;
          var timeStamp = this.postList[i].timestamp;
          var like = this.postList[i].like
          var comments = this.postList[i].comments;
          var caption = this.postList[i].caption;
          var postDetails = new posts(_id, userName, profileUrl, postUrl, timeStamp, like, comments, caption);
          posts.postArray.push(postDetails);
          if (this.postList[i].name == this.currentUser) {
            var _id = this.postList[i]._id;
            var userName = this.postList[i].name;
            var profileUrl = this.postList[i].profileUrl;
            var postUrl = this.postList[i].postUrl;
            var timeStamp = this.postList[i].timestamp;
            var like = this.postList[i].like
            var comments = this.postList[i].comments;
            var caption = this.postList[i].caption;
            myPosts.myPostArray.push(postDetails);
            // console.log(" my posts :::", myPosts.myPostArray)
            console.log(" my posts :::", myPosts.myPostArray.length)

          }
        }
      });
  }

  updatePost(postId: any, newLike: any,) {
    console.log("liking posts", newLike);
    let postDetail = {
      postId: postId,
      newLike: newLike
    }
    this.http.put<{ message: any }>
      (this.POST_BACKEND_URL, postDetail).subscribe(response => {
        console.log("response.message", response.message);
      });
  }


  updatePostComment(postId: any, newComment: any,) {
    let postDetail = {
      postId: postId,
      newComment: newComment
    }
    this.http.put<{ message: any }>
      (this.POST_BACKEND_URL, postDetail).subscribe(response => {
        console.log("response.message", response.message);
      });
  }


  updatePostRealTime(postId: any, value: any) {
    let newComment = { postId: postId, value: value }
    this.commentChanged.emit(newComment);
  }
  updatePostRealLike(postId: any, like: any) {
    let newLike = { postId: postId, like: like }
    this.likeChanged.emit(newLike);

  }

}
