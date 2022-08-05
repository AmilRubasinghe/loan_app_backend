const { query } = require('express');
const express = require('express');
const connection = require('../connection');
const router = express.Router();
var bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
require('dotenv').config();
var auth =require('../services/authentication')
var checkRole = require('../services/checkRole')


/*User Registation*/
router.post('/signup', (req, res) => {
    let user = req.body;

    var query = "select email, password, role, status from user where email=? ";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                var addQuery = "insert into user (name, contactNumber, email, password,status, role,isAddLoan,isLoanApprove) values(?,?,?,?,'false','user','false','false')";
                connection.query(addQuery, [user.name, user.contactNumber, user.email, user.password], (error, results) => {
                    if (!error) {
                        return res.status(200).json({ message: 'Successfully Registered',status:200 });
                    } else {
                        return res.status(500).json(error);
                    }
                });
            } else {
                return res.status(400).json({ message: 'Email Already exist',status:400 });
            }

        } else {
            return res.status(500).json(err);

        }
    });
});
/*User Login*/
router.post('/login', (req, res) => {
    let user = req.body;
    var query = "select email, password, role,name, status,id from user where email=? ";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || !(bcrypt.compareSync(user.password, results[0].password)) ){
                return res.status(401).json({ message: "Incorect Username or Password",status:401});
            } else if (results[0].status === 'false') {
                return res.status(401).json({ message: "Wait for Admin Approval",status:401 });
            } else if (bcrypt.compareSync(user.password, results[0].password)) {
                console.log(results);
                const response = { email: results[0].email, role: results[0].role, name:results[0].name, id:results[0].id};
                const accesToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
                res.status(200).json({ token: accesToken, status:200})
            } else {
                return res.status(400).json({ message: "Something went wrong. Please try again later",status:400});
            }

        } else {
            return res.status(500).json(err);
        }
    });
});
/*All user get*/
router.get('/',auth.authenticationToken, (req, res) => {
    // var query = "select id,name,email,contactNumber,status,isAddLoan,isLoanApprove from user where role ='user'";
    var query = "select loan.amount , loan.file,loan.duration,loan.installment ,user.name,user.id,user.email,user.contactNumber,user.status,user.isAddLoan,user.isLoanApprove from user LEFT JOIN loan on user.id=loan.userId  where user.role ='user'";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json({ data: results, status:200 })
        } else
            return res.status(500).json(err);
    });
});
/*User Aproval*/
router.patch('/:id/approve',auth.authenticationToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id;
    let user = req.body;
    var query = "update user set status=? where id=?"
    connection.query(query, [user.status, id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message : 'User id does not found', status: 404 })
            } else {
                return res.status(200).json({ message: "User Updated Successfully" ,status:200});
            }
        } else {
            return res.status(500).json(err);
        }
    });
});

/*Loan Aproval*/
router.patch('/:id/loanApprove',auth.authenticationToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id;
    let user = req.body;
    var query = "update user set isLoanApprove=? where id=?"
    connection.query(query, [user.isLoanApprove, id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message : 'User id does not found', status: 404 })
            } else {
                return res.status(200).json({ message: "User Updated Successfully" ,status:200});
            }
        } else {
            return res.status(500).json(err);
        }
    });
});

/*Loan Reject*/
router.patch('/:id/loanReject',auth.authenticationToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id;
    let user = req.body;
    var query = "update user set isAddLoan=? where id=?"
    var deleteQuery = "delete from loan where userId=?";
    connection.query(query, [user.isAddLoan, id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message : 'User id does not found', status: 404 })
            } else {
                connection.query(deleteQuery, [id], (error, result) => { 
                    if (!error) {
                        if (result.affectedRows == 0) {
                            return res.status(404).json({ message : 'User id does not found', status: 404 })
                        } else {
                            return res.status(200).json({ message: "User Updated Successfully" ,status:200});
                        }
                       
                    } else {
                        return res.status(500).json(error);
                    }
                })
               
                
            }
        } else {
            return res.status(500).json(err);
        }
    });
});


module.exports = router;