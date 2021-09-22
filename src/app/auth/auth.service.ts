import { Injectable, EventEmitter } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { Inject } from '@angular/core';
import { AuthData, LogInData } from "./auth-data.model";
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token: any;
  private tokenTimer: any;
  private userId: any;
  public userEmail: any;
  public userName: any;
  public BACKEND_URL;
  private AUTH_BACKEND_URL;


  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router, @Inject(DOCUMENT) private document: Document) {
    this.BACKEND_URL = this.document.location.origin;
    this.AUTH_BACKEND_URL = this.BACKEND_URL + "/api/user";
  }

  getToken() {
    console.log("getToken inside authSevice" + this.token);
    return this.token;
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

  getUserName() {
    return this.userName;
  }
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(authData: AuthData) {
    this.http.post(this.AUTH_BACKEND_URL + "/signup", authData).subscribe(
      async (response) => {
        console.log("Response", response)
        this.router.navigate(["/login"]);
      },
      error => {
        this.authStatusListener.next(false);
      }
    );
  }

  login(logInData: LogInData) {
    console.log("log in data :: ", logInData)
    this.http
      .post<{
        token: string;
        email: string;
        userId: string;
        userName: string;
      
      }>(this.AUTH_BACKEND_URL + "/login", logInData).subscribe(
        async (response) => {
          console.log("res :: ", response)
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = 31536000;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.userEmail = response.email;
            this.userName = response.userName;
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
            );

            this.router.navigate(["/main"]);
          }
        },
        error => {
          this.authStatusListener.next(false);
          console.log("error while login ", error);
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
    userName: string,
  ) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("userName", userName);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      userEmail: userEmail,
      userName: userName,
    };
  }
}
