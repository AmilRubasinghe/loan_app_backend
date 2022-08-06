const request = require('supertest');
const app = require('../../index');

describe('test login route', () => {
  it('POST /user/login --> loging user', () => request(app)
    .post('/user/login')
    .send({
      email: 'admin@gmail.com',
      password: 'Test@1234',

    }).expect(200)
    .then((response) => {
      expect(response.body).toEqual(
        {
          token: expect.any(String),
          status: 200,
        },
      );
    }));

  it('POST /user/login --> loging user with incorect password', () => request(app)
    .post('/user/login')
    .send({
      email: 'admin@gmail.com',
      password: 'Test@123',

    }).expect(401)
    .then((response) => {
      expect(response.body).toEqual({
        message: 'Incorect Username or Password',
        status: 401,
      });
    }));

  it('POST /user/login --> loging user with incorect password', () => request(app)
    .post('/user/login')
    .send({
      email: 'test@gmail.com',
      password: 'Test@1234',

    }).expect(401)
    .then((response) => {
      expect(response.body).toEqual({
        message: 'Wait for Admin Approval',
        status: 401,
      });
    }));
});
