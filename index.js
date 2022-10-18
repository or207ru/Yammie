//------------------------
// Initializing the server
//------------------------

const express = require("express");
const app = express();
require("./db");

// middleware
app.use(require('cors')());
app.use(express.json());

// routing
app.use('/api/orders', require("./routs/orders"));

const port = process.env.PORT || 1000;

// raising server
app.listen(port, () => {
    console.log(`hii from port ${port}`);
});

module.exports = app;