import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Subscription } from "rxjs";

import { AuthService } from "../auth/auth.service";
import { PostsService } from "../services/posts.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit, OnDestroy {
  userName: string;
  userEmail:string;
  userIsAuthenticated = false;
  private authListenerSubs: Subscription;

  constructor(private authService: AuthService,private router: Router,private postsService: PostsService) {}

  ngOnInit() {

    this.userIsAuthenticated = this.authService.getIsAuth();
    const token = this.authService.getToken();
    const helper = new JwtHelperService();
    const decoded= helper.decodeToken(token);
     console.log("emial :: ",decoded)
     this.userEmail = decoded.userId.slice(17,decoded.length)
    console.log("user email :" ,this.userEmail)
    var authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });
    // this.userName = this.authService.getUserName();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        // this.userName = this.authService.getUserName();

      });
      this.postsService.getUsers().then(res => {
        var allUsers :any[] = [];
        allUsers = res['userList']
        console.log("userList : ", allUsers)
        for(let i=0;i< allUsers.length;i++){
          if(allUsers[i].name == this.userEmail){
        this.userName = allUsers[i].userName
          }
        }
      })
  }
  viewProfile() {
    this.router.navigate(["/profile"]);
  }
  
  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
