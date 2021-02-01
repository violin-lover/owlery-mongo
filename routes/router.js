const express = require("express");

const body_parser = require("body-parser");

const router = express.Router();
//const router = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongo = require("../lib/db.js");
const dbName = "msgsdb";
const userCollection = "users";
const msgCollection = "msgs";
ObjectId = require('mongodb').ObjectID;



const userMiddleware = require("../middleware/users.js");

mongo.initialize(dbName, msgCollection, function(msgColl) {
  msgColl.find().toArray(function(err, result) {
    if (err) throw err;
    console.log(result)
  });
  router.get("/read-message", userMiddleware.isLoggedIn, (req, res, next) => {
    msgColl.find().toArray((error, messages) => { // callback of find
      if (error) throw error;
      for(message of messages){
        if (message.likersId == undefined || !message.likersId.includes(req.userData.userId)){
          message.liked = false;
        } else {
          message.liked = true;
        }
      }
      res.json(messages);
    });
  });
})



mongo.initialize(dbName, msgCollection, function(msgColl) {
  msgColl.find().toArray(function(err, result) {
    if (err) throw err;
    console.log(result)
  });
  router.post("/post-message", userMiddleware.isLoggedIn, (req, res, next) => {
    console.log("about to post message");
    let item = {
      author: req.userData.username,
      message: req.body.message,
      posted_at: req.body.posted_at
    }
    console.log(item.posted_at)
    msgColl.insertOne(item, (error, result) => {
      if (error) {
        throw error;
        return res.status(400).send({
          msg: error,
        });
      }
      return res.status(201).send({
        msg: "Message Sent!",
      });
    })
  });
})

mongo.initialize(dbName, msgCollection, function(msgColl) {
  msgColl.find().toArray(function(err, result) {
    if (err) throw err;
    console.log(result)
  })
  router.post("/like-message", userMiddleware.isLoggedIn, (req, res, next) => {
    console.log(req.body.liked)
      if(req.body.liked == false){
          msgColl.update(
            { _id: ObjectId(req.body.id) },
            { $inc: { likes: 1 }, $push: { likersId: req.userData.userId} },
            { upsert: true },
            function(err, result) {
              if (err) throw err;
              console.log(result);
            })
      } else {
          res.status(202).send({
            msg: "liked"
          })
      }
        })
  })


mongo.initialize(dbName, userCollection, function(userColl) {
router.post("/follow-user", userMiddleware.isLoggedIn, (req, res, next) => {
    userColl.update(
            {email: req.userData.userId},
            {$inc: {followers: 1}, $push: {following: req.body.followedId}},
            {upsert: false},
            function(err, result) {
              if (err) throw err;
              console.log(result);
            })
            return res.status(201).send({
            msg: "Is now following"
        });
});
})

mongo.initialize(dbName, userCollection, function(userColl) { // successCallback
  // get all items
  userColl.find().toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
  });

  router.post("/sign-up", userMiddleware.validateRegister, (req, res, next) => {
    console.log("Proceed to find username");
    userColl.find({ $or: [{ email: req.body.email }, { username: req.body.username }] }).toArray((error, result) => {
      console.log(result)
      if (result.length > 0) {
        console.log("username or email is in use!")
        return res.status(409).send({
          msg: "This username or email is already in use!",
        });
      } else {
        console.log("username is avaliable")
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err,
            });
          } else {
            let newPass = {
              email: req.body.email,
              username: req.body.username,
              password: hash
            }
            console.log("Proceed to insert" + newPass);
            userColl.insertOne(newPass, (error, result) => {
              if (error) {
                throw error;
                return res.status(400).send({
                  msg: error,
                });
              }
              return res.status(201).send({
                msg: "Registered",
              });
            });
          }
        });
      }
    });
  })
});

mongo.initialize(dbName, userCollection, function(userColl) { // successCallback
  // get all items
  userColl.find().toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
  });

  router.post("/login", (req, res, next) => {
    console.log("entering/logging in with " + req.body.username);
    console.log(req.body);
    userColl.find({ username: req.body.username }).toArray((err, result) => {
      // user does not exists
      if (err) {
        throw err;
        return res.status(400).send({
          msg: err,
        });
      }
      if (!result.length) {
        return res.status(401).send({
          msg: "You don't exist",
        });
      }
      // check password
      bcrypt.compare(req.body.password, result[0]["password"], (bErr, bResult) => {
        // wrong password
        //console.log("result 0" + result[0])
        if (bErr) {
          throw bErr;
          return res.status(401).send({
            msg: "Password is incorrect!",
          });
        }
        if (bResult) {
          const token = jwt.sign(
            {
              username: result[0].username,
              userId: result[0].email,
            },
            "SECRETKEY",
            {
              expiresIn: "7d",
            }
          );
          //userColl.updateOne({})
          return res.status(200).send({
            msg: "Logged in!",
            token,
            user: result[0],
          });
        }
        return res.status(401).send({
          msg: "Username or password is incorrect!",
        });
      });
    });
  });
})
module.exports = router;