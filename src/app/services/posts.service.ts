import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../auth/auth.service';

interface GetPostResponse {
  postList: []
}
interface GetUserResponse {
  userList: []
}
@Injectable({
  providedIn: 'root'
})
export class PostsService {
  POST_BACKEND_URL: any;
  USERS_BACKEND_URL: any;
  DOCUMENT_BACKEND_URL: any;
  EDIT_BACKEND_URL: any;
  currentUser = this.authService.getUserName();
  commentChanged = new EventEmitter<any>();
  likeChanged = new EventEmitter<any>();

  constructor(@Inject(DOCUMENT) private document: Document, private http: HttpClient, private authService: AuthService) {
    this.POST_BACKEND_URL = this.authService.BACKEND_URL + "/api/post";
    this.DOCUMENT_BACKEND_URL = this.document.location.origin;
    this.USERS_BACKEND_URL = this.DOCUMENT_BACKEND_URL + "/api/usersList";
    this.EDIT_BACKEND_URL = this.DOCUMENT_BACKEND_URL + "/api/edit";
  }

  getUsers(): Promise<GetUserResponse> {
    return this.http.get<GetUserResponse>(this.USERS_BACKEND_URL).toPromise();
  }

  getPost(postCount: number): Promise<GetPostResponse> {
    let queryParams = `?postCount=${postCount}`;
    return this.http.get<GetPostResponse>(this.POST_BACKEND_URL + queryParams).toPromise();
  }

  editProfile(editData: any) {
    this.http.post<{ message: string }>(this.EDIT_BACKEND_URL, editData).subscribe(
      async (response) => {
        console.log("Response", response)
      }
    );
  }

  post(postData: any) {
    const userQuery = `?userName=${postData.get('userName')}`;
    this.http.post<{ message: string, _id: any }>
      (this.POST_BACKEND_URL + userQuery, postData).subscribe(
        async (response) => {
          console.log(response)
        }
      );
  }

  updatePost(postDetail: any) {
    this.http.put<{ message: string }>
      (this.POST_BACKEND_URL, postDetail).subscribe(response => {
        console.log("response.message", response.message);
      });
  }

  updatePostRealTime(postId: string, value: string) {
    let newComment = { postId: postId, value: value }
    this.commentChanged.emit(newComment);
  }

  updatePostRealLike(postId: string, like: []) {
    let newLike = { postId: postId, like: like }
    this.likeChanged.emit(newLike);
  }
}
