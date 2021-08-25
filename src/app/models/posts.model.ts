// export class users {
//     constructor(
//       public userName:any,
//     ) {}
//     public static userArray = [];
//   }
  
  export class users {
    constructor(
      public userName:any
    ) {}
    public static userArray :any [] = [];
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
  