// export class users {
//     constructor(
//       public userName:any,
//     ) {}
//     public static userArray = [];
//   }
  
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
  export interface postData {
    userName:any;
    profileUrl:any;
    postUrl:any;
    caption:any;
    timeStamp:any
  }
  export interface EditData {
    userName:string;
    url:any;
    email: string;
    bio:string;
    phoneNumber:string;
    gender:string
    password: string;
  }
  