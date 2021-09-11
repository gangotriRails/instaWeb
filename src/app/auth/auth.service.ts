import { Injectable, EventEmitter } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { Inject } from '@angular/core';
import { AuthData ,LogInData} from "./auth-data.model";
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token: any ;
  private tokenTimer: any;
  private userId: any  ;
  public userEmail: any  ;
  public userName:any;
  public fullName:any;
  public profile:any;
  private isLoaded :any  ;
  public email :any  ;
  public BACKEND_URL;
  private AUTH_BACKEND_URL;
  public bio:any
  public phone:any
  public gender:any
    // Pouch & Couch related details
  private dbUrl: any  ;
  public userDb: any  ;
  private userDbKey: any  ;
  private userDbPwd: any  ;
 


  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router, @Inject(DOCUMENT) private document: Document) {
    //// console.log("APP_BASE_HREF "+this.document.location.origin);
    this.BACKEND_URL = this.document.location.origin;
    this.AUTH_BACKEND_URL = this.BACKEND_URL + "/api/user";
  }

  getToken() {
    // console.log("getToken inside authSevice"+this.token);
    return this.token;
  }

  getUserDbDetails() {
    let userDbDetails = {
      "dbUrl": this.dbUrl,
      "userDb": this.userDb,
      "userDbKey": this.userDbKey,
      "userDbPwd": this.userDbPwd,
    }
    return userDbDetails;
  }
  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getUserEmail() {
    return this.userEmail;
  }

  getUserName(){
    return this.userName;
  }
  getUserFullName(){
    return this.fullName;
  }
  
  getProfile(){
    return this.profile;
  }
  getBio(){
    return this.bio;
  }
  getPhone(){
    return this.phone
  }
  getGender(){
     return this.gender
   }
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string,fullName:string,userName:string, password: string) {
    // console.log("creating post requesting for signUp")
    const authData: AuthData = { email: email,fullName:fullName,userName:userName,profile:"assets/images/default.png", password: password};
    this.http.post(this.AUTH_BACKEND_URL + "/signup", authData).subscribe(
      async (response) => {
        // console.log("Response",response)
        this.router.navigate(["/login"]);
      },
      error => {
        this.authStatusListener.next(false);
      }
    );
  }

  login(email: string,password: string) {
    const logInData: LogInData = { email: email, password: password };
    this.http
      .post<{ token: string;
         expiresIn: number;
         userId: string,
         email: string,
         fullName:string,
         userName:string,
         profile:any,
         isLoaded: string,
         dbUrl: string,
         userDb: string,
         bio:any,
         phone:any,
         gender:any,
         userDbKey: string,
         userDbPwd: string }>(
        this.AUTH_BACKEND_URL + "/login",
        logInData
      ).subscribe(
        async (response) => {
          // console.log("login response : ",response)
          const token = response.token;
          this.token = token;
          // console.log("+++++++++++++++",response.profile);
          if (token) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.userEmail = response.email;
            this.userName = response.userName;
            this.fullName = response.fullName;
            this.profile = response.profile;
            this.bio = response.bio;
            this.phone = response.phone;
            this.gender = response.gender;
            this.isLoaded = response.isLoaded;
            this.dbUrl = response.dbUrl
            this.userDb = response.userDb;
            this.userDbKey = response.userDbKey;
            this.userDbPwd = response.userDbPwd;
            this.authStatusListener.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(token, 
              expirationDate, 
              this.userId, 
              this.userEmail,
              this.userName,
              this.fullName ,
              this.profile,
              this.bio,
              this.phone,
              this.gender,
              this.dbUrl, 
              this.userDb, 
              this.userDbKey, 
              this.userDbPwd);
          
             this.router.navigate(["/main"]);
          }
        },
        error => {
          this.authStatusListener.next(false);
          // console.log("error while login ",error);
        }
      );
  }


  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.userEmail = authInformation.userEmail;
      this.userName = authInformation.userName;
      this.fullName = authInformation.fullName;
      this.profile = authInformation.profile;
      this.bio = authInformation.bio;
      this.phone = authInformation.phone;
      this.gender = authInformation.gender;
      this.dbUrl = authInformation.dbUrl;
      this.userDb = authInformation.userDb;
      this.userDbKey = authInformation.userDbKey;
      this.userDbPwd = authInformation.userDbPwd;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.router.navigate(["/main"]);
   
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    this.userName = null;
    this.fullName = null;
    this.profile = null;
    this.userEmail = null;
    this.bio = null;
    this.phone = null;
    this.gender = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/login"]);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }


  private saveAuthData(token: string, 
    expirationDate: Date, 
    userId: string, 
    userEmail: string,
    userName:string,
    fullName:string,
    profile:any, 
    bio:any,
    phone:any,
    gender:any,
    dbUrl: string, 
    userDb: string, 
    userDbKey: string, 
    userDbPwd: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("userName", userName);
    localStorage.setItem("fullName", fullName);
    localStorage.setItem("profile", profile);
    localStorage.setItem("bio", bio);
    localStorage.setItem("phone", phone);
    localStorage.setItem("gender", gender);
    localStorage.setItem("dbUrl", dbUrl);
    localStorage.setItem("userDb", userDb);
    localStorage.setItem("userDbKey", userDbKey);
    localStorage.setItem("userDbPwd", userDbPwd);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("fullName");
    localStorage.removeItem("profile");
    localStorage.removeItem("bio");
    localStorage.removeItem("phone");
    localStorage.removeItem("gender");
    localStorage.removeItem("dbUrl");
    localStorage.removeItem("userDb");
    localStorage.removeItem("userDbKey");
    localStorage.removeItem("userDbPwd");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    const fullName = localStorage.getItem("fullName");
    const profile = localStorage.getItem("profile");
    const bio = localStorage.getItem("bio");
    const phone = localStorage.getItem("phone");
    const gender = localStorage.getItem("gender");
    const dbUrl = localStorage.getItem("dbUrl");
    const userDb = localStorage.getItem("userDb");
    const userDbKey = localStorage.getItem("userDbKey");
    const userDbPwd = localStorage.getItem("userDbPwd");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      userEmail: userEmail,
      userName:userName,
      fullName:fullName,
      profile:profile,
      bio:bio,
      phone:phone,
      gender:gender,
      dbUrl: dbUrl,
      userDb: userDb,
      userDbKey: userDbKey,
      userDbPwd: userDbPwd
    };
  }

 
}
