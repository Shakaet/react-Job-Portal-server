const express = require('express')
const app = express()
var cors = require('cors')
require('dotenv').config()
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000
app.use(cors({
  origin:["http://localhost:5173"],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser());



let logger=(req,res,next)=>{
  console.log("logger running")
  next()

}

let varifyToken=(req,res,next)=>{
  console.log("middleware running")

  let token =req.cookies?.token
  console.log(token)





  if(!token){
    return res.status(401).send({message:"unauthorized token"})
  }


  jwt.verify(token, process.env.JWT_Secret,(err, decoded)=>{

    if(err){
      return res.status(401).send({message:"unauthorized token"})
    }

    req.user=decoded
    next()
  });
  

  

}

// jobPortal
// 9yKyG4Oy6aPitW0d

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// console.log(process.env.DB_USER)



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Password}@cluster0.bnqcs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("jobPortal");
    const jobsDB = database.collection("jobs");
    const applicationDB = database.collection("jobApplication");
    

  
    //Api Related for token 

    // app.post("/jwt",async(req,res)=>{
      

    //   let userData=req.body

    //   let token= jwt.sign(userData, "secret", { expiresIn: "1h" });

    //   res.send(token)
      
    // })
    
    // app.post("/jwt",async(req,res)=>{
      

    //   let userData=req.body

    //   let token= jwt.sign(userData, process.env.JWT_Secret, { expiresIn: "1h" });

    //   res.send(token)
      
    // })


    app.post("/jwt",async(req,res)=>{
      

      let userData=req.body

      let token= jwt.sign(userData, process.env.JWT_Secret, { expiresIn: "1h" });

      res
      .cookie('token', token, {
        httpOnly: true,       // Prevent JavaScript access to the cookie
        secure: false,         // Send cookie over HTTPS only
        
    })
      .send({success:true})
      
    })



    // jobs APIs

    app.get("/jobs/:id",async(req,res)=>{

      let idx=req.params.id

      let query={_id:new ObjectId(idx)}
      const result = await jobsDB.findOne(query);
      res.send(result)
  })

  

    app.get("/jobs",logger,async(req,res)=>{
       console.log(("now jobs running"))
       let email= req.query.email

       let result;

       if(email){
         let query={hr_email:email}
        const cursor=jobsDB.find(query)
         result= await cursor.toArray()
        // res.send(result)
       }
     else{
      const cursor = jobsDB.find();
         result= await cursor.toArray()

     }
        // const cursor = jobsDB.find(query);
        //  result= await cursor.toArray()
        // res.send(result)

       res.send(result)
        
    })


    app.post("/jobs",async(req,res)=>{

      let formData=req.body
      console.log(formData)
      const result = await jobsDB.insertOne(formData);
      res.send(result)
    })

      // application Apis



      
  app.patch("/job-application/:id",async(req,res)=>{
    let idx= req.params.id

    let data=req.body
    console.log(data.status)


    const filter = {_id: new ObjectId(idx)};
    const updateDoc = {
      $set: {
        status: data.status
      },
    };

    const result = await applicationDB.updateOne(filter, updateDoc);

    res.send(result)




  })


      app.get("/job-application/job/:jobId",async(req,res)=>{
        let idx=req.params.jobId
    
        let query={job_id:idx}
        const result = await applicationDB.find(query).toArray();
        res.send(result)
    
    
      })


      app.post("/jobs-application",async(req,res)=>{

        let data=req.body
        console.log(data)
    
        const result = await applicationDB.insertOne(data);


        /// Application count (Not the best way) (use aggregate)

        let id= data.job_id

        let query ={_id :new ObjectId(id)}

        let job= await jobsDB.findOne(query)
        let count=0

        if(job.applicationCount){
          count=job.applicationCount+1
        }
        else{
          count=1
        }
        // now update

        let filter={_id: new ObjectId(id)}
        let updatedDoc={
          $set:{
            applicationCount:count
          }
        }

        let updatedResult=await jobsDB.updateOne(filter,updatedDoc)


        res.send(result)


      })

      app.delete("/jobs-application/:id",async(req,res)=>{

        let idx=req.params.id

        let query={_id: new ObjectId(idx)}

        const result = await applicationDB.deleteOne(query);
        res.send(result)

      })


     


      app.get("/jobs-application",varifyToken,async(req,res)=>{

        let email=req.query.email

        let query={applicantMail:email}


          if(req.user.email !==  req.query.email){
            return res.status(403).send({message:"forbidden token"})
          }
        // console.log(req.cookies)



        const cursor = applicationDB.find(query);
        let result= await cursor.toArray()
        

        for(let application of result){
          console.log(application.job_id)

          let query1={_id:new ObjectId(application.job_id)}
          const job = await jobsDB.findOne(query1);
          if(job){
            application.title=job.title
            application.company=job.company
            application.location=job.location
            application.company_logo=job.company_logo
          }
        }

        res.send(result)


      })

     








    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})