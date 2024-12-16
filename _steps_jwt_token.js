

// step 1:after successful login:generate a jwt token
//    npm i jsonwebtoken,cookie-parser
//    jwt.sign(payload,secret,{expiresIn:"1h"})

const { CommandFailedEvent } = require("mongodb")


// step 2: send token (generated in the server side) to client side

// localStorage=>easier

// httpOnly cookies => better

// res
// .cookie('token', token, {
//   httpOnly: true,       // Prevent JavaScript access to the cookie
//   secure: false,         // Send cookie over HTTPS only
  
// })
// .send({success:true})

// })


// step 3:for sensitive or secure or protected or private apis: send token to the server side


// on the server side:
// app.use(cors({
//   origin:["http://localhost:5173"],
//   credentials:true
// }))


// on the client side:
// axios.post("http://localhost:3000/jwt",user,{withCredentials:true})
// .then(data=>console.log(data.data))

// ,, {withCredentials:true}


// step 4: validate the data in server side

// if valid then give the data to client
// if not valid then logout



// generates a token by Command
//  1. node
//  2. require("crypto").randomBytes(64).toString("hex")