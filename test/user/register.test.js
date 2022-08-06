/* eslint-disable import/extensions */
const request = require('supertest');
const app = require('../../index.js');
const connection = require('../../connection');

const resetDatabase = (id) => {
  const query = 'delete from user where id=?';
  connection.query(query, [id], (err) => {
    if (err) { console.log('Error while deleting the user'); }
  });
};
describe('test create route', () => {
  const email = 'testname@gmail.com';
  let userId;
  it('POST /user/signup --> signup user', async () => {
    const { status, body: { message, id } } = await request(app)
      .post('/user/signup')
      .send({
        name: 'test name',
        contactNumber: '0714567879',
        email,
        password: '$2a$10$w1H/E0VmVn1hMwNI98RYZOgPGmkOg3Gn3Vpo6NpXB31qEojcWwnbi',
        status: 'false',
        role: 'user',
        isAddLoan: 'false',
        isLoanApprove: 'false',
      });
    userId = id;
    expect(status).toBe(200);
    expect(message).toEqual('Successfully Registered');
  });

  it('POST /user/sigup --> signup user with exsisting email.', () => request(app)
    .post('/user/signup')
    .send({
      name: 'test name',
      contactNumber: '0714567879',
      email,
      password: '$2a$10$w1H/E0VmVn1hMwNI98RYZOgPGmkOg3Gn3Vpo6NpXB31qEojcWwnbi',
      status: 'false',
      role: 'user',
      isAddLoan: 'false',
      isLoanApprove: 'false',
    }).expect(400));

  afterAll(() => {
    resetDatabase(userId);
  });
});
