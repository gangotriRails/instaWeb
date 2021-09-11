  export class users {
    constructor(
      public userName:any,
      public userProfile:any,
      public userFullName:any
    ) {}
    public static userArray :any [] = [];
  }

  export class posts {
    constructor(
      public _id: any,
      public userName:any,
      public profileUrl:any,
      public postUrl:any,
      public timeStamp:any,
      public like: any, 
      public comments: any,
      public caption:any
    ) {}
    public static postArray :any [] = [];
  }

  export class myPosts {
    constructor(
      public _id: any,
      public userName:any,
      public profileUrl:any,
      public postUrl:any,
      public timeStamp:any,
      public like: any, 
      public comments: any,
      public caption:any
    ) {}
    public static myPostArray :any [] = [];
  }