require('express');
const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const connection = require('../connection');
require('dotenv').config();
const auth = require('../services/authentication');
const role = require('../services/checkRole');

/* User Registation */
router.post('/signup', (req, res) => {
  const user = req.body;

  const query = 'select email, password, role, status from user where email=? ';
  // eslint-disable-next-line consistent-return
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        const addQuery = "insert into user (name, contactNumber, email, password,status, role,isAddLoan,isLoanApprove) values(?,?,?,?,'false','user','false','false')";
        connection.query(
          addQuery,
          [user.name, user.contactNumber, user.email, user.password],
          (error) => {
            if (!error) {
              return res.status(200).json({ id: results.insertId, message: 'Successfully Registered', status: 200 });
            }
            return res.status(500).json(error);
          },
        );
      } else {
        return res.status(400).json({ message: 'Email Already exist', status: 400 });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});
/* User Login */
router.post('/login', (req, res) => {
  const user = req.body;
  const query = 'select email, password, role,name, status,id from user where email=? ';
  // eslint-disable-next-line consistent-return
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || !(bcrypt.compareSync(user.password, results[0].password))) {
        return res.status(401).json({ message: 'Incorect Username or Password', status: 401 });
      } if (results[0].status === 'false') {
        return res.status(401).json({ message: 'Wait for Admin Approval', status: 401 });
      } if (bcrypt.compareSync(user.password, results[0].password)) {
        const response = {
          email: results[0].email, role: results[0].role, name: results[0].name, id: results[0].id,
        };
        const accesToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
        res.status(200).json({ token: accesToken, status: 200 });
      } else {
        return res.status(400).json({ message: 'Something went wrong. Please try again later', status: 400 });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});
/* All user get */
router.get('/', auth.authenticationToken, role.checkRole, (req, res) => {
  const query = "select loan.amount , loan.file,loan.duration,loan.installment ,user.name,user.id,user.email,user.contactNumber,user.status,user.isAddLoan,user.isLoanApprove from user LEFT JOIN loan on user.id=loan.userId  where user.role ='user'";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json({ data: results, status: 200 });
    } return res.status(500).json(err);
  });
});
/* User Aproval */
router.patch('/:id/approve', auth.authenticationToken, role.checkRole, (req, res) => {
  const { id } = req.params;
  const user = req.body;
  const query = 'update user set status=? where id=?';
  connection.query(query, [user.status, id], (err, results) => {
    if (!err) {
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'User id does not found', status: 404 });
      }
      return res.status(200).json({ message: 'User Updated Successfully', status: 200 });
    }
    return res.status(500).json(err);
  });
});

/* Loan Aproval */
router.patch('/:id/loanApprove', auth.authenticationToken, role.checkRole, (req, res) => {
  const { id } = req.params;
  const user = req.body;
  const query = 'update user set isLoanApprove=? where id=?';
  connection.query(query, [user.isLoanApprove, id], (err, results) => {
    if (!err) {
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'User id does not found', status: 404 });
      }
      return res.status(200).json({ message: 'User Updated Successfully', status: 200 });
    }
    return res.status(500).json(err);
  });
});

/* Loan Reject */
router.patch('/:id/loanReject', auth.authenticationToken, role.checkRole, (req, res) => {
  const { id } = req.params;
  const user = req.body;
  const query = 'update user set isAddLoan=? where id=?';
  const deleteQuery = 'delete from loan where userId=?';
  // eslint-disable-next-line consistent-return
  connection.query(query, [user.isAddLoan, id], (err, results) => {
    if (!err) {
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'User id does not found', status: 404 });
      }
      connection.query(deleteQuery, [id], (error, result) => {
        if (!error) {
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User id does not found', status: 404 });
          }
          return res.status(200).json({ message: 'User Updated Successfully', status: 200 });
        }
        return res.status(500).json(error);
      });
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
