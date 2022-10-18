//----------------
// Managing tests
//---------------

const app = require('../index');
const request = require('supertest');
require('../db');


// check new db, empty time frame and insertion of new row to the db
describe('Testing: filled up db', () => {

  // check for an error response while the server hasn't yet been set to 'use'
  test(`Should respond with status 500`, async () => {
    const response = await request(app).get(`/api/orders/time_range/day`)
      .set('role', 'admin');
    expect(response.statusCode).toBe(500);
  });

  // tests that nothing is getting back if the time frame dosent match any row
  test(`Should respond with status 204`, async () => {
    const response = await request(app).get(`/api/orders/time_range/day`)
      .set('role', 'admin');
    expect(response.statusCode).toBe(204);
  });

  // tests insertion of a new row
  test(`Should set new row`, async () => {
    const response = await request(app).post(`/api/orders/new_order`)
      .set({ 'role': 'user', Accept: 'application/json' })
      .send({
        'customer_name': 'avi',
        'customer_phone': '050-1234567',
        'customer_address': 'tel aviv',
        'dishes': { 'pasta': 3 }
      });
    expect(response.statusCode).toBe(201);
  });
});


// testing request for order by id
describe('Testing: getting order by id', () => {

  // tests well formed request
  test(`Should respond with a msg of successed search
    and status 200`, async () => {
    const response = await request(app).get(`/api/orders/1`)
      .set('role', 'admin');
    expect(response.statusCode).toBe(200);
    expect(response.body.msg).toBe(`Order 1 retrived succssesfuly`);
  });

  // tests unathorizied request
  test(`Should respond with a 403 (user dosn't allowed)`, async () => {
    const response = await request(app).get(`/api/orders/1`)
      .set('role', 'user');
    expect(response.statusCode).toBe(403);
  });

  // tests request with empty result
  test(`Should respond with a msg of vain search
    and status 404`, async () => {
    const response = await request(app).get(`/api/orders/0`)
      .set('role', 'admin');
    expect(response.body.msg).toBe(`There is no such order`);
    expect(response.statusCode).toBe(404);
  });
});


// testing request by time range
describe('Testing: order according to time range', () => {

  // tests well formed request
  test(`Should respond with a msg of successed search
    and status 200`, async () => {
    const response = await request(app).get(`/api/orders/time_range/week`)
      .set('role', 'admin');
    expect(response.statusCode).toBe(200);
    expect(response.body.msg)
    .toBe(`Orders of this week retrived succssesfuly`);
  });

  // tests unfamiliar time frame
  test(`Should respond with a msg of bad request
    and status 400`, async () => {
    const response = await request(app).get(`/api/orders/time_range/weak`)
      .set('role', 'admin');
    expect(response.statusCode).toBe(400);
    expect(response.body.msg)
    .toBe(`Please choose only form 'day', 'week', or 'month'`);
  });
});


// testing bad request of insertion 
describe('Testing: bad request of insertion', () => {

  // tests missing parameters
  test(`Should respond with a msg of missing info
    and status 400`, async () => {
    const response = await request(app).post(`/api/orders/new_order`)
      .set({ 'role': 'user', Accept: 'application/json' })
      .send({
        'customer_name': 'avi',
        'customer_phone': '050-1234567',
        'customer_address': 'tel aviv'
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.msg).toBe('Missing some info');
  });

  // tests request with no quantity
  test(`Should respond with a msg of missing quantity
    and status 400`, async () => {
    const response = await request(app).post(`/api/orders/new_order`)
      .set({ 'role': 'user', Accept: 'application/json' })
      .send({
        'customer_name': 'avi',
        'customer_phone': '050-1234567',
        'customer_address': 'tel aviv',
        'dishes': { 'pasta': 0 }
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.msg).toBe("There is no even one dish in this order");
  });

  // tests unathorizied user
  test(`Should respond with a msg of unathorizied user
    and status 403`, async () => {
    const response = await request(app).post(`/api/orders/new_order`)
      .set({ 'role': 'usadminer', Accept: 'application/json' })
      .send({
        'customer_name': 'avi',
        'customer_phone': '050-1234567',
        'customer_address': 'tel aviv',
        'dishes': { 'pasta': 3 }
      });
    expect(response.statusCode).toBe(403);
    expect(response.body.msg).toBe("you are not allowed for this action");
  });
});


// testing updating
describe('Testing: updating request', () => {

  // tests well formed request
  test(`Should respond with a msg of succsess
    and status 200`, async () => {
    const response = await request(app).put(`/api/orders/cahnge_order/2`)
      .set({ 'role': 'user', Accept: 'application/json' })
      .send({
        'changes': { 'pasta': 2 }
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.msg).toBe(`Update made succssesfully`);
  });

  // tests attempt to update order that dosen't exist
  test(`Should respond with a msg of fail to locate the order
    and status 404`, async () => {
    const response = await request(app).put(`/api/orders/cahnge_order/10`)
      .set({ 'role': 'user', Accept: 'application/json' })
      .send({
        'changes': { 'pasta': 2 }
      });
    expect(response.statusCode).toBe(404);
    expect(response.body.msg).toBe(`There is no such an order`);
  });

  // tests a request that doesn't affect because the details are the same
  test(`Should respond with status 404`, async () => {
    const response = await request(app).put(`/api/orders/cahnge_order/2`)
      .set({ 'role': 'user', Accept: 'application/json' })
      .send({
        "changes": { "pasta": 2 }
      });
    expect(response.statusCode).toBe(404);
    expect((JSON.parse(response.text)).msg)
      .toBe(`Nothing changed it was the same as the original`);
  });

  // tests a request that denay change because 15 minute has pass
  test(`Should respond with status 404`, async () => {
    const response = await request(app).put(`/api/orders/cahnge_order/1`)
      .set({ 'role': 'user', Accept: 'application/json' })
      .send({
        "changes": { 'humus': 4 }
      });
    expect(response.statusCode).toBe(404);
    expect((JSON.parse(response.text)).msg)
      .toBe('Not possible - 15 minutes have allready passed');
  });
});