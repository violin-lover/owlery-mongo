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
    })
})