//jshint esversion:6
//requiring modules
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

//Database Definition
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "0000",
    database: "knowledgeHub"
});

//Some important variables

let listOfAdmins = {
    "sameer_admin" : ["4148","Sameer","Pandya"],
    "vicky_admin" : ["1677","Vicky","Kaushal"]
}; //to check admin login
let count = 1001;                   //for khid
let demandID = 3001;                //for demand id
let scurrid = 0;                    // for active logged in student's khid
let ucurrid = 0;                    // for active logged in user's khid
let error_code = 0;                 //for generating errors
let scurrname = [];                 // for active logged in student's name
let ucurrname = [];                 // for active logged in user's name
let admname = [];                   // for active logged in admin's name
let stdList = [];                   //for generating students list in admin page
let usrList = [];                   //for generating users list in admin page
let demandedBooks = [];             //for generating demanded book's list in admin page
let books = [];                     //for displaying books in user or student page
let videos = [];                    //for providing video list to students
let notes = [];                     //for providing note list to students
let videolnk = "";                  //for sending videos link from video page to video player page
let dem_khid = "";                  //person's KHID who demanded book
let dem_fname = "";                 //person's Fname who demanded book
let dem_lname = "";                 //person's Lname who demanded book
let dem_role = "";                  //person's Role who demanded book
let rdrct = "";                     //since demand book is common functionality of both user and student hence this helps in redirect user to userpage and student to student page
let SBJ = "";                       //for detecting subject from study material page

//Using required modules
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());


//connecting database
db.connect(function(err){
    if(err){throw err;}
    console.log("Mysql connected");
});


//Registration post request(whenever someone sign's up his entries come here)
app.post("/signup", function(req,res){
    db.query("select count(*) as quantity from user",function(err,reslt){
        if(err){
            res.redirect("/");
            throw err;
        }
        count = count + reslt[0].quantity; //adding value to count to generate new khid
    })
    db.query("select count(*) as quantity from student",function(err,reslt){
        if(err){
            res.redirect("/");
            throw err;
        }
        count = count + reslt[0].quantity;  //adding value to count to generate new khid
        let temp_role = req.body.Role;
        let temp_stID = req.body.stdID;
        let temp_fname = req.body.fname;
        let temp_lname = req.body.lname;
        let temp_email = req.body.email;
        let temp_dob = req.body.DateOfBirth;
        let temp_gender = req.body.Gender;
        let temp_username = req.body.username;
        let temp_password = req.body.password;
        let temp_cpassword = req.body.cpassword;
        //Registration of a user
        if (temp_role === "U"){
            if(temp_fname && temp_lname && temp_email && temp_dob && temp_gender && temp_username && temp_password && temp_cpassword){
                if (temp_password === temp_cpassword){
                    let insert_query = "insert into user values (?, ?, ?, ?, ?, ?, ?, ?);";
                    let value_query = [count, temp_fname, temp_lname, temp_email,temp_dob,temp_gender,temp_username,temp_password];

                    db.query(insert_query,value_query,function(error,result){
                        if (error){
                            let err = error.sqlMessage;
                            let regx1=/Uusername/i;
                            let regx2=/Upassword/i;
                            let regx3=/Uemail/i;
                            if (regx1.test(err)){
                                console.log("Username is same");
                                error_code = 100;
                                res.redirect("/error");
                                
                            }
                            else if (regx2.test(err)){
                                console.log("Password is same");
                                error_code = 101;
                                res.redirect("/error");
                                
                            }
                            else if (regx3.test(err)){
                                console.log("Email is same");
                                error_code = 102;
                                res.redirect("/error");
                            }
                            else {
                                console.log("Error");
                                error_code = 200;
                                res.redirect("/error");
                            }                         
                        }
                        else{
                            ucurrname.push(temp_fname);    //pushing user's name to display on page
                            ucurrname.push(temp_lname);
                            ucurrid = count;                //pushing user's khid to display on page
                            count = 1001;                   //returning count to 1001 so that new entry does not mess up the process of generating new KHID
                            res.redirect("/user");
                        }
                    });
                    
                }
                else{
                    console.log("password not match !!");
                    error_code = 103;
                    res.redirect("/error");
                }
            }
            else{
                console.log("Field left empty !!");
                error_code = 104;
                res.redirect("/error");
            }

        }
        //Registration of Student
        else if(temp_role === "S"){
            if(temp_stID && temp_fname && temp_lname && temp_email && temp_dob && temp_gender && temp_username && temp_password && temp_cpassword){
                if (temp_password === temp_cpassword){
                    let insert_query = "insert into student values (?, ?, ?, ?, ?, ?, ?, ?, ?);";
                    let value_query = [count, temp_stID, temp_fname, temp_lname, temp_email,temp_dob,temp_gender,temp_username,temp_password];

                    db.query(insert_query,value_query,function(error,result){
                        if (error){
                            let err = error.sqlMessage;
                            let regx1=/Susername/i;
                            let regx2=/Spassword/i;
                            let regx3=/Semail/i;
                            let regx4 = /StudentID/i;
                            if (regx1.test(err)){
                                console.log("Username is same");
                                error_code = 100;
                                res.redirect("/error");
                                
                            }
                            else if (regx2.test(err)){
                                console.log("Password is same");
                                error_code = 101;
                                res.redirect("/error");
                                
                            }
                            else if (regx3.test(err)){
                                console.log("Email is same");
                                error_code = 102;
                                res.redirect("/error");
                            }
                            else if (regx4.test(err)){
                                console.log("Student ID is same");
                                error_code = 105;
                                res.redirect("/error");
                            }
                            else {
                                console.log("Error");
                                error_code = 200;
                                res.redirect("/error");
                            }                         
                        }
                        else{
                            scurrname.push(temp_fname);     //same as user with student
                            scurrname.push(temp_lname);
                            scurrid = count;
                            count = 1001;
                            res.redirect("/student");
                        }
                    });
                    
                }
                else{
                    console.log("password not match !!");
                    error_code = 103;
                    res.redirect("/error");
                }
            }
            else{
                console.log("Field left empty !!");
                error_code = 104;
                res.redirect("/error");
            }
        }
        else{
            console.log("Error");
            error_code = 200;
            res.redirect("/error");
        }
    })
});

//Login process
app.post("/signin",function(req,res){
    let temp_member = req.body.Member;
    let temp_uname = req.body.username;
    let temp_pword = req.body.password;
    //User login
    if(temp_uname && temp_pword && temp_member){
        if (temp_member === "UR"){
            db.query("select khID,Ufname,Ulname,Upassword from user where Uusername = ?",[temp_uname],function(err,reslt){
                if(err){
                    console.log("Error");
                    error_code = 200;
                    res.redirect("/error");
                }
                else{
                    if(reslt.length === 0){
                        console.log("wrong username");
                        error_code = 106;
                        res.redirect("/error");
                    }
                    else{
                        let org_pwd = reslt[0].Upassword;
                        let org_fn = reslt[0].Ufname;
                        let org_ln = reslt[0].Ulname;
                        let org_id = reslt[0].khID;
                        if(temp_pword === org_pwd){
                            ucurrname.push(org_fn);
                            ucurrname.push(org_ln);
                            ucurrid = org_id;
                            res.redirect("/user");
                        }
                        else{
                            console.log("wrong password");
                            error_code = 107;
                            res.redirect("/error");
                        }
                    }
                }
            });
        }
        //student login
        else if(temp_member === "ST"){
            db.query("select khID,Sfname,Slname,Spassword from student where Susername = ?",[temp_uname],function(err,reslt){
                if(err){
                    console.log("Error");
                    error_code = 200;
                    res.redirect("/error");
                }
                else{
                    if(reslt.length === 0){
                        console.log("wrong username");
                        error_code = 106;
                        res.redirect("/error");
                    }
                    else{
                        let org_pwd = reslt[0].Spassword;
                        let org_fn = reslt[0].Sfname;
                        let org_ln = reslt[0].Slname;
                        let org_id = reslt[0].khID;
                        if(temp_pword === org_pwd){
                            scurrname.push(org_fn);
                            scurrname.push(org_ln);
                            scurrid = org_id;
                            res.redirect("/student");
                        }
                        else{
                            console.log("wrong password");
                            error_code = 107;
                            res.redirect("/error");
                        }
                    }
                }
            });
        }
        //admin login
        else if(temp_member === "AD"){
            if (temp_uname in listOfAdmins){
                if(temp_pword === listOfAdmins[temp_uname][0]){
                    admname.push(listOfAdmins[temp_uname][1]);
                    admname.push(listOfAdmins[temp_uname][2]);
                    res.redirect("/Admin");    
                }
                else{
                    console.log("wrong password");
                    error_code = 107;
                    res.redirect("/error");
                }
            }
            else{
                console.log("wrong username");
                error_code = 106;
                res.redirect("/error");
            }
        }
    }
    
    else{
        console.log("Field left empty !!");
        error_code = 104;
        res.redirect("/error");
    }
})



//---------------------------------------Request posted by user or student demanding a book----------------------------------------
app.post("/demandbk",function(req,res){
    db.query("select count(*) as quantity from demanded",function(err,reslt){
        if (err){
            res.redirect("/user");
            throw err;
        }
        demandID = demandID + reslt[0].quantity
        let authorname = req.body.authorname;
        let bookname = req.body.bookname;
        if(req.body.UserData === "user"){
            dem_khid = ucurrid;
            dem_fname = ucurrname[0];
            dem_lname = ucurrname[1];
            dem_role = "User";
            rdrct = "/user";
        }
        else{
            dem_khid = scurrid;
            dem_fname = scurrname[0];
            dem_lname = scurrname[1];
            dem_role = "Student";
            rdrct = "/student";
        }
        if (authorname && bookname && dem_fname && dem_khid && dem_lname && dem_role){
            let query = "insert into demanded values (?, ?, ?, ?, ?, ?, ?);";
            let queryValue = [demandID, dem_khid, dem_fname, dem_lname, bookname, authorname, dem_role];
            db.query(query,queryValue,function(err,reslt){
                if(err){
                    res.redirect(rdrct);
                    throw err;
                }
                demandID = 3001;
                res.redirect(rdrct);
            })
        }
        else{
            console.log("Field left empty !!");
            if(dem_role === "User"){
                error_code = 108;
            }
            else{
                error_code = 109;
            }
            res.redirect("/error");
        }
    })
    
    
})



//------------------------------------Book to be posted by Admin on user and student page------------------------------------------
app.post('/postbook',function(req,res){
    let img_url = req.body.bookimgurl;
    let book_title = req.body.booktitle;
    let book_desc = req.body.bookdesc;
    let book_url = req.body.bookurl;
    let id = req.body.did;

    db.query('insert into books values (?,?,?,?);',[img_url,book_title,book_desc,book_url],function(err,reslt){
        if(err){            
            res.redirect("/Admin");
            throw err;
        }
        else{
            console.log("Book added!");
        }
    });

    db.query('delete from demanded where DemandID = ?',[id],function(err,result){
        if(err){
            res.redirect("/Admin");
            throw err;
        }
        else{
            console.log("Demand is successfully approved.");
        }
    });
    res.redirect('/Admin');

});





//------------------------------------Admin Rejecting a Book Demand-----------------------------------------------
app.post('/rejectDem',function(req,res){
    let id = req.body.did;
    db.query('delete from demanded where DemandID = ?',[id],function(err,result){
        if(err){
            res.redirect("/Admin");
            throw err;
        }
        else{
            console.log("Demand is successfully rejected.");
        }
    });
    res.redirect('/Admin');

});





//----------------------------------------------Generating Error Page------------------------------------------------
app.post("/error",function(req,res){
    let ret_page = req.body.rvalue
    res.redirect(ret_page);
});






//----------------------------------------------Logout Functionality------------------------------------------------
app.post("/logout",function(req,res){
    if(req.body.usr === "admin"){
        admname = [];
    }
    else if(req.body.usr === "user"){                               //Upon logging out ... emptying the currnames 
        ucurrname = [];                                             //for new user to have smooth experience
    }
    else{
        scurrname = [];
    }
    res.redirect("/");
})





//---------------------------------Post to Display User and Student List on Admin Page--------------------------------------
app.post("/studentList",function(req,res){
    res.redirect("/studentList");
})
app.post("/userList",function(req,res){
    res.redirect("/userList");
})




//------------------------------------------------------Study Material Page-------------------------------------------------
app.post("/studyMAT",function(req,res){
    res.redirect("/studyMAT");
})






//-----------------------------------------------------Homepage of User and Student------------------------------------------
app.post("/hpage",function(req,res){
    res.redirect("/Admin");
})
app.post("/spage",function(req,res){
    res.redirect("/student");
})





//------------------------------------------------Post to open Video Lectures and Notes of Subjects----------------------------------------
app.post("/materials",function(req,res){
    if(req.body.sbjct === "Electronics"){
        
        res.redirect("/electronics");
    }
    if(req.body.sbjct === "Maths"){
        
        res.redirect("/maths");
    }
    if(req.body.sbjct === "SE"){
        
        res.redirect("/se");
    }
    if(req.body.sbjct === "CO"){
        
        res.redirect("/nuy");
    }
    if(req.body.sbjct === "AFL"){
        
        res.redirect("/nuy");
    }
})





//----------------------------------------------------Video Lecture Pages-----------------------------------------------------------------
app.post("/maths",function(req,res){
    res.redirect("/maths");
})
app.post("/electronics",function(req,res){
    res.redirect("/electronics");
})
app.post("/se",function(req,res){
    res.redirect("/se");
})





//------------------------------------------------------Lecture Notes Pages--------------------------------------------------------------
app.post("/mnotes",function(req,res){
    res.redirect("/mnotes");
})
app.post("/snotes",function(req,res){
    res.redirect("/snotes");
})
app.post("/enotes",function(req,res){
    res.redirect("/enotes");
})






//--------------------------------------------------Video Player post to play Video------------------------------------------------------
app.post("/videoplayer",function(req,res){
    videolnk = req.body.vdolink;
    res.redirect("/videoplayer");
})







//--------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------PAGE RENDERING RESULTS-------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------




//-------------------------Homepage-------------------------------
app.get("/", function(req,res){
    res.render("homepage");
})


//-------------------admin page loading----------------------
app.get("/Admin",function(req,res){     
    db.query("select * from demanded",function(error,reslt){
        if(error){
            res.redirect("/");
            throw error;
        }
        demandedBooks = reslt;
    })
    db.query("select * from user",function(error,reslt){
        if(error){                                                  //before generating admin page ... 
            res.redirect("/");                                      //loading user list, student list and
            throw error;                                            //demanded books so that they are visible to admin
        }
        usrList = reslt;
    })
    db.query("select * from student",function(error,reslt){
        if(error){
            res.redirect("/");
            throw error;
        }
        stdList = reslt;
        res.render("admin", {name : admname, dbooks : demandedBooks});
    })
})


//-------------------user page loading----------------------
app.get("/user", function(req,res){
    db.query("select * from books",function(err,reslt){
        if(err){
            res.redirect("/");
            throw err;                                          //Loading books for displaying on user's page
        }
        books = reslt;
        res.render("user",{id : ucurrid, name : ucurrname, uplBooks : books});
    })
})



//-------------------student page loading----------------------
app.get("/student", function(req,res){
    db.query("select * from books",function(err,reslt){
        if(err){
            res.redirect("/");
            throw err;                                              //Loading books for displaying on user's page
        }
        books = reslt;
        res.render("student",{id : scurrid, name : scurrname, uplBooks : books});
    })
})



//-------------------Student and User List on Admin Page----------------------
app.get("/studentList",function(req,res){
    res.render("st_list", {name : admname, SLst : stdList});
    
})
app.get("/userList",function(req,res){
    res.render("usr_list", {name : admname, ULst : usrList});
})



//-----------------------------Study Material Page----------------------------------
app.get("/studyMAT",function(req,res){
    res.render("studyMAT",{name : scurrname});
})





//-----------------------------Error Page----------------------------------
app.get("/error",function(req,res){
    res.render("error",{er_code : error_code});
})




//-------------------------Video Player Page------------------------------
app.get("/videoplayer",function(req,res){
    res.render("videoplayer",{link : videolnk, name : scurrname});
})



//--------------------------Video Pages-----------------------------------
app.get("/maths",function(req,res){
    db.query("select * from videos where subject = 'Maths';",function(err,reslt){
        if(err){
            throw err;
        }
        videos = reslt;        
        res.render("maths",{name : scurrname, vlist : videos});
    })
})
app.get("/electronics",function(req,res){
    db.query("select * from videos where subject = 'Electronics';",function(err,reslt){
        if(err){
            throw err;
        }
        videos = reslt;        
        res.render("electronics",{name : scurrname, vlist : videos});
    })
})
app.get("/se",function(req,res){
    db.query("select * from videos where subject = 'SE';",function(err,reslt){
        if(err){
            throw err;
        }
        videos = reslt;        
        res.render("se",{name : scurrname, vlist : videos});
    })
})




//------------------------------------Notes Pages---------------------------------
app.get("/mnotes",function(req,res){
    db.query("select * from notes where subject = 'Maths';",function(err,reslt){
        if(err){
            throw err;
        }
        notes = reslt;        
        res.render("mnotes",{name : scurrname, nlist : notes});
    })
})
app.get("/enotes",function(req,res){
    db.query("select * from notes where subject = 'Electronics';",function(err,reslt){
        if(err){
            throw err;
        }
        notes = reslt;
        res.render("enotes",{name : scurrname, nlist : notes});
    })
})
app.get("/snotes",function(req,res){
    db.query("select * from notes where subject = 'SE';",function(err,reslt){
        if(err){
            throw err;
        }
        notes = reslt;        
        res.render("snotes",{name : scurrname, nlist : notes});
    })
})




//------------------------------------Not Yet Uploaded---------------------------------------------
app.get("/nuy",function(req,res){
    res.render("notuploaded",{name : scurrname});
})


//----------------------------server port designation----------------------------------
app.listen(4400,function(){
    console.log("server started on port 4400!");
})
