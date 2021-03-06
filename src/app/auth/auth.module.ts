import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { LoginComponent } from "./login/login.component";
import { SignUpComponent } from "./sign-up/sign-up.component";
import { AngularMaterialModule } from "../angular-material.module";
import { AuthRoutingModule } from "./auth-routing.module";
import { JwtHelperService } from '@auth0/angular-jwt';


@NgModule({
  declarations: [LoginComponent, SignUpComponent],
  imports: [CommonModule, AngularMaterialModule, FormsModule, AuthRoutingModule],
  providers: [
    JwtHelperService
  ],
})
export class AuthModule {}
