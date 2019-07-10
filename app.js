const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const jwt = require('jsonwebtoken');

dotenv.config({
    path: '.env'
});

const app = express();

const privateKey = fs.readFileSync('private.key', 'utf8');
const passPhrase = process.env.PASS_PHRASE;

app.get('/jwt', (req, res) => {
    // const token = jwt.sign({ "body": "This is my body" }, passPhrase, { algorithm: 'HS256'});
    const token = jwt.sign({ "body": "This is my body" }, privateKey, { algorithm: 'HS256'});
    res.send(token);
})


app.get("/", (req,res)=>{
    res.send("Hi there")
})

app.get("/protected",isAuthorized, (req,res)=>{
    res.json({"message":"protected message"});
})

app.get("/open-message",(req,res)=>{
    res.json({"message": "My message"});
});

/**
 * Function isAuthorized checks if the request id authorized to access the endpoint
* @param {http request} req 
 * @param {http response} res 
 * @param {pass} next 
 */
function isAuthorized(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        // retrieve the authorization header and parse out the
        // JWT using the split function
        console.log(req.headers);
        const token = req.headers.authorization.split(" ")[1];
        
        // Here we validate that the JSON Web Token is valid and has been 
        // created using the same private pass phrase
        jwt.verify(token, privateKey, { algorithm: "HS256" }, (err, user) => {
            
            // if there has been an error...
            if (err) {  
                // shut them out!
                res.status(500).json({ error: "Not Authorized" });
                throw new Error("Not Authorized");
            }
            // if the JWT is valid, allow them to hit
            // the intended endpoint
            return next();
        });
    } else {
        // No authorization header exists on the incoming
        // request, return not authorized and throw a new error 
        res.status(500).json({ error: "Not Authorized" });
        throw new Error("Not Authorized");
    }
}



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});