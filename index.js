const express = require('express')
const app = express()
var cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000
app.use(cors())
app.use(express.json())

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

    app.get("/jobs/:id",async(req,res)=>{

      let idx=req.params.id

      let query={_id:new ObjectId(idx)}
      const result = await jobsDB.findOne(query);
      res.send(result)
  })



    app.get("/jobs",async(req,res)=>{
        const cursor = jobsDB.find();
        let result= await cursor.toArray()
        res.send(result)
    })

      // application Apis


      app.post("/jobs-application",async(req,res)=>{

        let data=req.body
        console.log(data)
    
        const result = await applicationDB.insertOne(data);
        res.send(result)


      })


      app.get("/jobs-application",async(req,res)=>{

        let email=req.query.email

        let query={applicantMail:email}



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