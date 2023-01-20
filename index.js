const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectID } = require('bson');
const port = process.env.PORT || 5000
const jwt=require('jsonwebtoken');

app.use(cors())
app.use(express.json())
require('dotenv').config();



const uri = `mongodb+srv://${process.env.User_Name}:${process.env.Password}@cluster0.1mrcu36.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send({ message: 'tore ami chini nh,tore dimu nh kono data' })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.SECRET_TOKEN, function (error, decoded) {
      if (error) {
          return res.status(401).send({ message: 'tore ami chini nh,tore dimu nh kono data' })
      }
      req.decoded = decoded;
      next();

  })
}



async function run() {
    try{
        const serviceCollection = client.db('photo-guru').collection('service')
        const reviewCollection = client.db('photo-guru').collection('review')
        app.get('/service', async(req,res)=>{
            const query = {}
            const cursor = serviceCollection.find(query)
            const service = await cursor.limit(3).toArray()
            res.send(service)
        })

        app.get('/allService', async(req,res)=>{
            const query = {}
            const cursor = serviceCollection.find(query)
            const service = await cursor.toArray()
            res.send(service)
        })

        app.get('/allService/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectID(id)}
            const service = await serviceCollection.findOne(query)
            res.send(service)


// post review......
    app.post("/review", async (req, res) => {
      const review = req.body;
    //   console.log(riview);
      const cursor = await reviewCollection.insertOne(review);
      res.send(cursor);
    });
    //get review........
    //get review........
    app.get("/review", async (req, res) => {
        let query = {};
        if (req.query.serviceID) {
          query = { serviceID: req.query.serviceID };
        }
        const cursor = await reviewCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });

    // end.................
        })

        app.get("/myReview",verifyJWT, async (req, res) => {
          const decoded = req.decoded;
          if(decoded.email !== req.query.email){
            res.send({message:'tore ami chini nh,tore dimu nh kono data'})
          }
          let query = {};
          if (req.query.email) {
            query = { email: req.query.email};
          }
          const cursor = reviewCollection.find(query);
          const result = await cursor.toArray();
          res.send(result);
        });

        // review delete 
        app.delete(`/delete/:id`, async(req,res)=>{
          const id=req.params.id;
          const query = {_id: ObjectID(id)}
          const result = await reviewCollection.deleteOne(query)
          res.send(result)
        })
        // update

        app.get('/myReview/:id', async(req, res)=>{
          const id = req.params.id;
          const query = { _id: ObjectID(id) };
          const service = await reviewCollection.findOne(query);
          res.send(service);
      })


      app.put('/myReview/:id', async(req, res)=>{
        const id=req.params.id;
        const filter={_id: ObjectID(id)};
        const user=req.body;
        const option={upsert: true};
      
        const updateUser={
            $set:{
                message: user.message
            }
        }

        const updateReview=await reviewCollection.updateOne(filter, updateUser, option)
        
        res.send(updateReview)
    })

      
    // post service....
    app.post("/service", async (req, res) => {
      const product = req.body;
      const result = await serviceCollection.insertOne(product);
      res.send(result);
    });
    // JWT

    app.post('/jwt', (req, res) => {
      const user = req.body;
      console.log(user.email);
      const token = jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: '1d' })
      res.send({ token })

  })

    }
    finally{

    }
    
}
run().catch(err=>{
    console.log(err)
})






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})