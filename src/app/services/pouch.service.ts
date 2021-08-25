import { Injectable, NgZone, OnInit } from '@angular/core';
// import PouchDB from 'pouchdb/'
// import * as PouchDB from 'pouchdb-core';
// import PouchDB from 'node_modules/pouchdb';
import * as PouchDB from 'pouchdb'; 
import { AuthService } from '../auth/auth.service';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

import { environment } from "../../environments/environment";

const production = environment.production;

@Injectable()
export class PouchService implements OnInit {

  couchBaseUrl: any;
  couchDbName: any;
  couchDbUrl: any;
  couchDbKey: any;
  couchDbPwd: any;
  pouchDbInstance: any;
  remoteDbInstance: any;
  public BACKEND_URL : any;

  data: any;

  constructor(public zone: NgZone, @Inject(DOCUMENT) private document: Document) {
  //constructor(public zone: NgZone) {
    this.BACKEND_URL = this.document.location.origin;
  }

  ngOnInit(): void { }

  async createPouchDbInstance(_couchDbName :any) {
    this.pouchDbInstance = await new PouchDB(_couchDbName, { revs_limit: 1, auto_compaction: true, skip_setup: true });
    return this.pouchDbInstance;
  }

  async createRemoteDbInstance(_dbUrl :any , _couchDbName : any, _couchDbKey :any, _couchDbPwd :any) {
    console.log("_couchDbKey",_couchDbKey,"_couchDbPwd",_couchDbPwd,"couchBaseUrl",_dbUrl,"_couchDbName",_couchDbName);
    let res = encodeURIComponent(_couchDbKey);
    console.log("production",production);
    if(production == false) {
      this.couchDbUrl = `${_dbUrl}/${_couchDbName}`;
      console.log("In development mode, this.couchDbUrl = " + this.couchDbUrl);
      this.remoteDbInstance = new PouchDB(this.couchDbUrl, { revs_limit: 1, auto_compaction: true, skip_setup: true });
    } else {
      this.couchDbUrl = `${this.BACKEND_URL}/couchdb/${_couchDbName}`;
      console.log("In production mode, this.couchDbUrl = " + this.couchDbUrl);
      this.remoteDbInstance = new PouchDB(this.couchDbUrl, { revs_limit: 1, auto_compaction: true, skip_setup: true, adapter: 'http', "auth": {"username": _couchDbKey, "password": _couchDbPwd}});
    }
    return this.remoteDbInstance;
  }

  async checkDbStatus(dbInstance :any) {
    let status = await dbInstance.info(function (err :any, info :any) {
      if (err) {
        console.log(err);
        return false
      } else {
        // console.log("userDbInstance in authService", info);
        return true;
      }
    });
    return status;
  }
}
