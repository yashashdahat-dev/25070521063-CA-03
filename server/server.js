const express = require("express");
const {MongoClient,ObjectId} = require("mongodb");
const bodyparser = require("body-parser");
const bCrypt = require("bcrypt");
const jwtToken = require("jsonwebtoken");


const app = express();
app.use(bodyparser.json());
const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri);
const port = 5000;


async function connectToMongoDb(){

    try {
        
        await client.connect();
        console.log("Connection successfully done with mongodb");

        app.listen(port,()=>{

            console.log("Server started at port : " + port);
        })

        
    } catch (error) {

        console.log("Connection failed to mongodb : " + error);
    }

}

connectToMongoDb();

const myDb = client.db("sitSecB");

app.get("/getall",async(req,res)=>{

    let data = await myDb.collection("student").find().toArray();

    res.send( data );

});

app.get("/get/:id",async(req,res)=>{

    const id = req.params.id;

    const student = await myDb.collection("student").findOne({_id : new ObjectId(id)});

    res.send( student );
});

app.post("/create",async(req,res)=>{

    console.log( req.body);

    const {name,age,status,password,email} = req.body;

    const hashedPass = await bCrypt.hash(password,10);

    const response = await myDb.collection("student").insertOne({name:name,age:age,status:status,password : hashedPass,email : email});

    res.send(response);

});

app.post("/login",async(req,res)=>{

    const {email,password} = req.body;

    const student = await myDb.collection("student").findOne({email : email});

    if( student != null ){

        const isCorrect = await bCrypt.compare(password,student.password);

        if( isCorrect ){

            const payLoad = {
                subject : student.name,
                role : student.status
            }

            res.send({jwtToken : jwtToken.sign(payLoad,"MY_SECRET_TOKEN")});
        }

    }
    else{

        res.send({msg : "Invalid Email"});
        res.statusCode(422);
    }

});

app.put("/update/:id",async(req,res)=>{

    const id = req.params.id;

    const student = await myDb.collection("student").findOne({_id : new ObjectId(id)});

    if( student != null ){

        const {status} = req.body;

        const response = await myDb.collection("student").updateOne({_id: new ObjectId(id)},{$set:{status:status}});

        res.send(response);
    }
    else{

        res.send({msg : "Student Id Invalid"});
        res.statusCode(404);

    }

});

app.delete("/delete/:id",async(req,res)=>{

    const id = req.params.id;

    const response = await myDb.collection("student").deleteOne({_id:new ObjectId(id)});

    res.send(response);

});