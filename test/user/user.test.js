const request = require('supertest');
const app = require('../../index');
const auth = require('../../services/authentication');
const connection = require('../../connection');

jest.mock('../../services/authentication');

const loanAdd = () => {
  const queryAdd = 'insert into loan (userId , amount , file,duration,installment) values(?,?,?,?,?)';
  connection.query(queryAdd,
    [12, 10000, 'files/1659720166568.pdf', 10, 1000.0],
    (err) => {
      if (err) { console.log('Error while deleting the user'); }
    });
};
describe('test get approve reject route', () => {
  auth.authenticationToken.mockImplementation((req, res, next) => next());
  it('GET /user --> array get user', async () => {
    const { body: { data: [userData] }, status } = await request(app)
      .get('/user');

    expect(status).toBe(200);
    expect(userData).toEqual({
      amount: expect.any(Number),
      file: expect.any(String),
      duration: expect.any(Number),
      installment: expect.any(Number),
      name: expect.any(String),
      id: expect.any(Number),
      email: expect.any(String),
      contactNumber: expect.any(String),
      status: expect.any(String),
      isAddLoan: expect.any(String),
      isLoanApprove: expect.any(String),
    });
  });

  it('PATCH /user/id/approve --> Admin approve the user registration', () => request(app)
    .patch('/user/12/approve')
    .send({
      status: 'true',
    }).expect(200)
    .then((response) => {
      expect(response.body).toEqual({
        message: 'User Updated Successfully',
        status: 200,
      });
    }));

  it('PATCH /user/id/approve --> Admin approve the user registration with worng userid', () => request(app)
    .patch('/user/9999/approve')
    .send({
      status: 'true',
    }).expect(404)
    .then((response) => {
      expect(response.body).toEqual({
        message: 'User id does not found',
        status: 404,
      });
    }));
  it('PATCH /user/id/loanApprove --> Admin approve the loan request', () => request(app)
    .patch('/user/12/loanApprove')
    .send({
      isLoanApprove: 'true',
    }).expect(200)
    .then((response) => {
      expect(response.body).toEqual({
        message: 'User Updated Successfully',
        status: 200,
      });
    }));

  it('PATCH /user/id/loanApprove --> Admin approve the loan request with worng userid', () => request(app)
    .patch('/user/9999/loanApprove')
    .send({
      isLoanApprove: 'true',
    }).expect(404)
    .then((response) => {
      expect(response.body).toEqual({
        message: 'User id does not found',
        status: 404,
      });
    }));
  it('PATCH /user/id/loanReject --> Admin reject the loan request', () => request(app)
    .patch('/user/12/loanReject')
    .send({
      isAddLoan: 'false',
    }).expect(200)
    .then((response) => {
      expect(response.body).toEqual({
        message: 'User Updated Successfully',
        status: 200,
      });
    }));

  it('PATCH /user/id/loanReject --> Admin reject the loan request with worng userid', () => request(app)
    .patch('/user/9999/loanApprove')
    .send({
      isAddLoan: 'false',
    }).expect(404)
    .then((response) => {
      expect(response.body).toEqual({
        message: 'User id does not found',
        status: 404,
      });
    }));
  afterAll(() => {
    loanAdd();
    jest.resetAllMocks();
  });
});
