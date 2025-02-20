const db = require('../db.js');

const sqlController = {};

//when the user doesn't exist yet, add user
sqlController.addUser = async(req,res,next) =>{
    qry = "INSERT INTO users (email) VALUES ( $1 );"
   
    const email = req.body.email;
    console.log(email);
    try{
        //takes email and injects it into the $1
        res.locals.user = await db.query(qry, email);
        console.log("addUser has been triggered!")
        next();
    }catch{
        console.log("error in addUser Middleware!");
        next();
    }
}

sqlController.addFav = async(req,res,next) =>{
    qry = "INSERT INTO fav_list (u_id,rr_name,rr_location,google_link,rating) VALUES ($1,$2,$3,$4,$5);"
    const u_id = req.body.u_id;
    const rrName = req.body.rrName;
    const rrLoc = req.body.rrLoc;
    const rrLink = req.body.rrLink;

    // console.log(req.body);

    const queryFav = {
        text: qry,
        values: [u_id, rrName, rrLoc, rrLink]
    }
    res.locals.user = await db.query(queryFav);
    console.log("addFav has been triggered!");
    next();
}

sqlController.delSaved = async(req,res,next) =>{
    qry = "DELETE * FROM fav_list WHERE "
}

sqlController.getList = async(req,res,next) =>{
    qry = "SELECT * FROM fav_list WHERE u_id = ($1);"

    const u_id = req.body.u_id;
    console.log(id);
    try{
        res.locals.user = await db.query(qry, u_id)
    }catch{
        console.log("error in getList Middleware!")
    }
}

module.exports = sqlController;