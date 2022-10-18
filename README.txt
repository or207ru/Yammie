Hello dear client.
This is a short guide that provides information on starting the server,
the functions the server provides and running the tests.

FIRST STEP // clone the project and install dependencies
	1. git clone https://github.com/or207ru/Yammie.git
	2. npm install

RUNNING TESTS
	1. npm run test
	2. 'ctrl' + 'c' to end the test session

ROUTINE WORK // the endpoints and how to use them
	1. open port 3306 // for 'mySQL' connection
	2. node index.js // for running the server

	* base url (while the hosting is local)
	  http://localhost:1000/api/orders/
	** The request should be with content content-type: application/json
	*** All the request should includ 'role' field in headers
	    and the value is either 'user' or 'admin'

	GET
	   http://localhost:1000/api/orders/:id
	   "Get order" // getting specific order by id
	   should supply valid id
	   and role = 'admin'	   

	GET
	   http://localhost:1000/api/orders/time_range/:range
	   "Get all orders from last day, last week and last month"
	   should supply one of three valid time range - [day, week, month]
	   and role = 'admin'

	POST
	   http://localhost:1000/api/orders/new_order
	   "Save new order"
	   should supply values:
	   REQUIRED: customer_name, customer_phone, customer_address, dishes
	   each value has a type of string
	   while dishes is json object that keys that are names of dishes
	   and the value is a number of quantity
	   (should include at least one dish with positive quantity)
	   OPTIONAL: comments, order_time (for a future order)
	   and role = 'user'

	PUT
	   http://localhost:1000/api/orders/cahnge_order/:id
	   "Change order (only if 15 minutes passed from when it was ordered)
	   should supply id of an existing order and values:
	   dishes and can supply comments
	   - new dishes will be added
	   - exist dishes will be update and quantity of 0 would lead for cancelation
	   and role = 'user
