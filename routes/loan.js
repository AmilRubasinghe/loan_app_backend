const { query } = require('express');
const express = require('express');
const connection = require('../connection');
const router = express.Router();
var fs = require("fs");

var auth =require('../services/authentication')
var checkRole = require('../services/checkRole')


/*Add new loan or update exsisting loan*/
router.post('/',auth.authenticationToken, (req, res, next) => {
    let loan = req.body;
    console.log(loan);
    var capturesTime = Date.now();

    const base64Data = loan.file.split(",")[1];
    let mimeType = (loan.file.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0]).split("/")[1];
    var filename = `files/${capturesTime}.${mimeType}`;
    fs.writeFile(filename, base64Data, 'base64', (err) => { });

    var queryAdd = "insert into loan (userId , amount , file,duration,installment) values(?,?,?,?,?)";
    var queryUpdate = "update loan set  amount=? , file=?,duration=?,installment=? where id=?";
    var userQuery = "update user set isAddLoan='true' where id=?"
    if (!loan.id) {
        connection.query(queryAdd, [loan.userId, loan.amount, filename, loan.duration, loan.amount / loan.duration], (error, result) => {
            if (!error) {
                connection.query(userQuery, [loan.userId], (e, results) => { 
                    if (!e) return res.status(200).json({ message: "Loan Add Successfully" });
                    else return res.status(500).json(error); 
                })
                

            } else {
                return res.status(500).json(error); 
            }
         })
    } else {
        connection.query(queryUpdate, [loan.amount, filename, loan.duration,loan.amount/loan.duration,loan.id], (err, results) => {
            if (!err) {
                return res.status(200).json({ message: "Loan Updated Successfully" });
                
            } else {
                return res.status(500).json(err);
            }
        }); 
    }
    
});

/*Get loan by using UserId*/
router.get('/', auth.authenticationToken, (req, res, next) => {
    const id = req.query.userId;
    console.log(id);
    var query = "select * from loan where userId=?";
    connection.query(query, [id],(err, result) => {
        if (!err) {
            return res.status(200).json({ data: result,status:200 });
        } else {
            return res.status(500).json(err);
        }
    });
});

/*Get All Loan*/
router.get('/all', auth.authenticationToken, (req, res, next) => {
    var query = "select loan.amount , loan.file,loan.duration,loan.installment,user.name from loan,user where user.id=loan.userId";
    connection.query(query,(err, result) => {
        if (!err) {
            return res.status(200).json({ data: result,status:200 });
        } else {
            return res.status(500).json(err);
        }
    });
});

/*update loan*/
router.patch('/:id',auth.authenticationToken, (req, res, next) => {
    const id = req.params.id;
    let loan = req.body;
    var query = "update loan set name =?, amount=?, file=? where id=?";
    connection.query(query, [loan.name, loan.amount, loan.file, id], (err, results) => {
        
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json(message = 'Loan id does not found')
            } else {
                return res.status(200).json({ message: "Loan Updated Successfully" });
            }
        } else {
            return res.status(500).json(err);
        }
    });
    
});

/*Delete loan*/
router.delete('/:id',auth.authenticationToken, (req, res, next) => {
    const id = req.params.id;
    var query = "delete from loan where id=?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json(message = 'Loan id does not found')
            } else {
                return res.status(200).json({ message: "Loan Deleted Successfully" });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

module.exports = router;