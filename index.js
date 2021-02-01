const express = require('express');
const sha1 = require("sha1");
const sendmail = require('./lib/sendMail.js');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));
//sends the user a link through email  that directs the user to the sign up form.
app.get("/verify/:email", (req, res) => {
  //receive email, form a link, send email with the link
  let email = req.params.email;
  console.log(email);
  sendmail(email);
  res.json({ "success": email});
})

const cors = require('cors');
// set up port
const PORT = 3000;

app.use(cors());
// add routes
const router = require('./routes/router.js');
app.use('/api', router);
// run server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


/*// parse JSON (application/json content-type)
server.use(body_parser.json());


// << db setup >>
const mongo = require("./db");
const dbName = "msgsdb";
const userCollection = "users";
const msgCollection = "msgs";

// << db init >>
mongo.initialize(dbName, userCollection, function(userColl) { // successCallback
    // get all items
    userColl.find().toArray(function(err, result) {
        if (err) throw err;
          console.log(result);
    });

    // << db CRUD routes >>
server.post("/users", (request, response) => {
    const item = request.body;
    userColl.insertOne(item, (error, result) => { // callback of insertOne
        if (error) throw error;
        // return updated list
        userColl.find().toArray((_error, _result) => { // callback of find
            if (_error) throw _error;
            response.json(_result);
        });
    });
});

}, function(err) { // failureCallback
    throw (err);
});

mongo.initialize(dbName, msgCollection, function(msgColl) { // successCallback
    // get all items
    msgColl.find().toArray(function(err, result) {
        if (err) throw err;
          console.log(result)
    });

server.post("/messages", (request, response) => {
    const item = request.body;
    msgColl.insertOne(item, (error, result) => { // callback of insertOne
        if (error) throw error;
        // return updated list
        msgColl.find().toArray((_error, _result) => { // callback of find
            if (_error) throw _error;
            response.json(_result);
        });
    });
});
});*/
