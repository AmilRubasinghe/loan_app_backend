require('express');
const express = require('express');
const fs = require('fs');
const connection = require('../connection');

const router = express.Router();
const auth = require('../services/authentication');
const role = require('../services/checkRole');

/* Add new loan or update exsisting loan */
// eslint-disable-next-line no-unused-vars
router.post('/', auth.authenticationToken, role.checkRole, (req, res, _) => {
  const loan = req.body;
  const capturesTime = Date.now();

  const base64Data = loan.file.split(',')[1];
  const mimeType = (loan.file.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0]).split('/')[1];
  const filename = `files/${capturesTime}.${mimeType}`;
  fs.writeFile(filename, base64Data, 'base64', () => { });

  const queryAdd = 'insert into loan (userId , amount , file,duration,installment) values(?,?,?,?,?)';
  const queryUpdate = 'update loan set  amount=? , file=?,duration=?,installment=? where id=?';
  const userQuery = "update user set isAddLoan='true' where id=?";
  if (!loan.id) {
    connection.query(
      queryAdd, [loan.userId, loan.amount, filename, loan.duration, loan.amount / loan.duration],
      // eslint-disable-next-line consistent-return
      (error) => {
        if (!error) {
          connection.query(userQuery, [loan.userId], (e) => {
            if (!e) return res.status(200).json({ message: 'Loan Add Successfully' });
            return res.status(500).json(error);
          });
        } else {
          return res.status(500).json(error);
        }
      },
    );
  } else {
    connection.query(
      queryUpdate, [loan.amount, filename, loan.duration, loan.amount / loan.duration, loan.id],
      (err) => {
        if (!err) {
          return res.status(200).json({ message: 'Loan Updated Successfully' });
        }
        return res.status(500).json(err);
      },
    );
  }
});

/* Get loan by using UserId */
// eslint-disable-next-line no-unused-vars
router.get('/', auth.authenticationToken, role.checkRole, (req, res, _) => {
  const id = req.query.userId;
  const query = 'select * from loan where userId=?';
  connection.query(query, [id], (err, result) => {
    if (!err) {
      return res.status(200).json({ data: result, status: 200 });
    }
    return res.status(500).json(err);
  });
});

/* Get All Loan */
// eslint-disable-next-line no-unused-vars
router.get('/all', auth.authenticationToken, role.checkRole, (req, res, _) => {
  const query = 'select loan.amount , loan.file,loan.duration,loan.installment,user.name from loan,user where user.id=loan.userId';
  connection.query(query, (err, result) => {
    if (!err) {
      return res.status(200).json({ data: result, status: 200 });
    }
    return res.status(500).json(err);
  });
});

/* update loan */
// eslint-disable-next-line no-unused-vars
router.patch('/:id', auth.authenticationToken, role.checkRole, (req, res, _) => {
  const { id } = req.params;
  const loan = req.body;
  const query = 'update loan set name =?, amount=?, file=? where id=?';
  connection.query(query, [loan.name, loan.amount, loan.file, id], (err, results) => {
    if (!err) {
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Loan id does not found' });
      }
      return res.status(200).json({ message: 'Loan Updated Successfully' });
    }
    return res.status(500).json(err);
  });
});

/* Delete loan */
// eslint-disable-next-line no-unused-vars
router.delete('/:id', auth.authenticationToken, role.checkRole, (req, res, _) => {
  const { id } = req.params;
  const query = 'delete from loan where id=?';
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Loan id does not found' });
      }
      return res.status(200).json({ message: 'Loan Deleted Successfully' });
    }
    return res.status(500).json(err);
  });
});

module.exports = router;
