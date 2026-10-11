// ****** STEP 01 *********
// interface Request {
//   user: ?{
//     id: string;
//   };
// }

//*******STEP 02 */
// namespace Express {
//   //normal typescript interface defined
//   interface Request {
//     user: ?{
//       id: string;
//     };
//   }
// }

// ***** STEP 03  ******
// make it global
declare global {
  //extend it to exisitng Express Request
  namespace Express {
    //normal typescript interface defined
    interface Request {
      user: ?{
        id: string;
      };
    }
  }
}

/*This is a module marker. It tells TypeScript to treat the file as a module, even though it exports no actual value.
Why does that matter?
declare global is intended to be used from within a module. Writing export {} ensures the file is treated as one.
It does not export your Request interface for normal imports, and it does not create an object at runtime. */
export {};
