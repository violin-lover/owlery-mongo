const express = require("express");
const server = express();

const body_parser = require("body-parser");

// parse JSON (application/json content-type)
server.use(body_parser.json());

const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userMiddleware = require("../middleware/users.js");

router.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
  //console.log(req.userData);
  res.send("Welcome!" + req.userData.username + "This is the secret content. Only logged in users can see that!");
});

router.get("/read-message", userMiddleware.isLoggedIn, (req, res, next) => {
  //console.log(req.userData);
  //Select * from Messages WHERE authorid in (SELECT followedId from User_follows WHERE followerId) =
  db.query(`Select * from Messages WHERE authorid in (SELECT followedId from User_follows WHERE followerId = '${req.userData.userId}')`, (err, result) => {
    if (err) {
      throw err;
    }
    res.json(result);
  })
});

router.get("/read-yourmessage", userMiddleware.isLoggedIn, (req, res, next) => {
  //console.log(req.userData);
  db.query(`Select * from Messages WHERE authorid = '${req.userData.userId}'`, (err, result) => {
    if (err) {
      throw err;
    }
    res.json(result);
  })
});



router.post("/post-message", userMiddleware.isLoggedIn, (req, res, next) => {
  //console.log(req.userData.username);
  db.query(`INSERT INTO Messages (author, authorid, message, posted_at) VALUES ('${req.userData.username}', '${req.userData.userId}', ${db.escape(req.body.message)}, now())`, (err, result) => {
    if (err) {
      throw err;
      return res.status(400).send({
        msg: err,
      });
    }
    return res.status(201).send({
      msg: "Sent!",
    });
  });
});

router.post("/like-message", userMiddleware.isLoggedIn, (req, res, next) => {
  console.log("yaaaaaaaaaaaaaaaaay" + req.userData.userId);
  console.log("WORRRRRRRRRRRRRRRRK" + req.body.id);
  db.query(`SELECT * FROM user_likes WHERE userid = '${req.userData.userId}' and messageid = ${req.body.id}`,
    (err, result) => {
      console.log("select query completed");
      if (err) {
        console.log("error" + err);
        throw err;
      }
      if (result.length == 0) {
        console.log("there is nothing");
        db.query(
          `UPDATE Messages 
            SET post_likes = post_likes + 1
            WHERE id = ${req.body.id}`
        );
        db.query(
          `INSERT INTO user_likes(userid, messageid, liked_time) VALUES ('${req.userData.userId}',${req.body.id},now())`
        )
      } else {
        console.log("already liked!!");
      }
    });
});

router.post("/follow-user", userMiddleware.isLoggedIn, (req, res, next) => {
  //console.log(req.body.followerId);
  console.log("this is the person you're following" + req.body.followedId);
  console.log(req.userData.userId);
  if (req.body.followedId == req.userData.userId) {
    console.log("You cannot follow yourself.")
  } else {
       db.query(`INSERT INTO User_follows(followerId, followedId) VALUES ('${req.userData.userId}', '${req.body.followedId}')`, (err, result) => {
        if (err) {
            return res.status(400).send({
                msg: err
            });
        }
        console.log(result);
        return res.status(201).send({
            msg: "Following!"
        });
    });
  }
});


router.post("/sign-up", userMiddleware.validateRegister, (req, res, next) => {
  db.query(`SELECT * FROM Users WHERE LOWER(username) = LOWER(${db.escape(req.body.username)});`, (err, result) => {
    if (result.length) {
      return res.status(409).send({
        msg: "This username is already in use!",
      });
    } else {
      // username is available
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).send({
            msg: err,
          });
        } else {
          // has hashed pw => add to database
          db.query(`INSERT INTO Users (id, username, password, registered) VALUES ('${req.body.email}', ${db.escape(req.body.username)}, ${db.escape(hash)}, now())`, (err, result) => {
            if (err) {
              throw err;
              return res.status(400).send({
                msg: err,
              });
            }
            return res.status(201).send({
              msg: "Registered!",
            });
          });
        }
      });
    }
  });
});

router.post("/login", (req, res, next) => {
  console.log("entering/logging in with " + req.body.username);
  console.log(req.body);
  db.query(`SELECT * FROM Users WHERE username = ${db.escape(req.body.username)};`, (err, result) => {
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
            userId: result[0].id,
          },
          "SECRETKEY",
          {
            expiresIn: "7d",
          }
        );
        db.query(`UPDATE Users SET last_login = now() WHERE id = '${result[0].id}'`);
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

module.exports = router;