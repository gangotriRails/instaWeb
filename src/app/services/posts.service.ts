import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../auth/auth.service';

interface GetPostResponse {
  postList: []
}
interface GetCommentResponse {
  commentsList: []
}
interface GetPostResponseById {
  postList: []
}
interface GetUserResponse {
  userList: []
}
@Injectable({
  providedIn: 'root'
})
export class PostsService {
  POST_BACKEND_URL: string;
  USERS_BACKEND_URL: string;
  DOCUMENT_BACKEND_URL: string;
  EDIT_BACKEND_URL: string;
  EDIT_POST_BACKEND_URL:string
  GETPOSTBYID_BACKEND_URL:string;
  GETPOSTBYUSER_BACKEND_URL:string;
  GET_COMMENTS_BACKEND_URL:string;
  commentChanged = new EventEmitter<any>();
  likeChanged = new EventEmitter<any>();

  constructor(@Inject(DOCUMENT) private document: Document, private http: HttpClient, private authService: AuthService) {
    this.POST_BACKEND_URL = this.authService.BACKEND_URL + "/api/post";
    this.DOCUMENT_BACKEND_URL = this.document.location.origin;
    this.USERS_BACKEND_URL = this.DOCUMENT_BACKEND_URL + "/api/usersList";
    this.EDIT_BACKEND_URL = this.DOCUMENT_BACKEND_URL + "/api/edit";
    this.EDIT_POST_BACKEND_URL = this.DOCUMENT_BACKEND_URL + "/api/editPost";
    this.GETPOSTBYID_BACKEND_URL = this.authService.BACKEND_URL + "/api/getPostById"
    this.GETPOSTBYUSER_BACKEND_URL = authService.BACKEND_URL + "/api/getPostByUser"
    this.GET_COMMENTS_BACKEND_URL = this.authService.BACKEND_URL + "/api/getComments"

  }

  getUsers(): Promise<GetUserResponse> {
    return this.http.get<GetUserResponse>(this.USERS_BACKEND_URL).toPromise();
  }

  getPost(postCount: number): Promise<GetPostResponse> {
    const queryParams = `?postCount=${postCount}`;
    return this.http.get<GetPostResponse>(this.POST_BACKEND_URL + queryParams).toPromise();
  }

  getPostByUser(postCount:number,userId:string):Promise<GetPostResponseById>{
    const queryParams = `?postCount=${postCount}&userId=${userId}`
    console.log("query params :",queryParams);
    return this.http.get<GetPostResponseById>(this.GETPOSTBYUSER_BACKEND_URL + queryParams).toPromise();
  }
  getPostById(Id:any):Promise<GetPostResponseById>{
    const queryParams = `?postId=${Id}`
    return this.http.get<GetPostResponseById>(this.GETPOSTBYID_BACKEND_URL + queryParams).toPromise();
  }
  getComments(count:number,postId:string):Promise<GetCommentResponse>{
    const queryParams = `?count=${count}&postId=${postId}`;
    return this.http.get<GetCommentResponse>(this.GET_COMMENTS_BACKEND_URL + queryParams).toPromise();
  }
  editPost(editPostData:any){
    return this.http.put<{ message: string }>(this.EDIT_POST_BACKEND_URL, editPostData).toPromise();
  }
  editProfile(editData: any) {
   return this.http.put<{ message: string }>(this.EDIT_BACKEND_URL, editData).toPromise();
  }
  deletePost(postId:string){
    const queryParams = `?postId=${postId}`;
    return this.http.delete<{ message: string; }>(this.POST_BACKEND_URL + queryParams).toPromise()
  }
  deleteComment(commentId:string,postId:string){
    const queryParams = `?commentId=${commentId}&postId=${postId}`;
    return this.http.delete<{ message: string; }>(this.GET_COMMENTS_BACKEND_URL + queryParams).toPromise()
  }
  post(postData: any,email:string) {
  return new Promise((resolve, reject) => {
    const userQuery = `?email=${email}`;
    this.http.post<{ message: string, _id: any  }>(this.POST_BACKEND_URL + userQuery, postData).subscribe(async response => {
      console.log("response message on session Db Creation", response.message);
      resolve(response);
    });
  })
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
