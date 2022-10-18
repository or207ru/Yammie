//---------------
// Order requests
//---------------

const router = require(`express`).Router();
const { myQuery } = require(`../db`);
const { getSecondOfRange } = require('../services');
const { permission, validId, formatingChanges } = require(`../middleware`);

// valid search ranges for orders
const SEARCH_RANGE = ['DAY', 'WEEK', 'MONTH'];
// Fifteen minutes in seconds
PERMITED_TIME_FOR_CHANGES = 15 * 60;


// GET order by id
router.get(`/:id`, permission('admin'), validId, async (req, res) => {
    try {
        const qry = `SELECT * FROM Orders WHERE order_id = ${req.id};`;
        const data = (await myQuery(qry))[0];
        if (!data) {
            return res.status(404).json({
                err: true,
                msg: `There is no such order`
            });
        }
        return res.json({
            err: false,
            msg: `Order ${req.id} retrived succssesfuly`,
            data
        });
    } catch (error) {
        return res.status(500).json({ err: true, msg: error });
    }
});


// GET orders of the last day / week / month
// The request reffer to the begining of each range i.e
// the begining of the day / week / month
router.get(`/time_range/:range`, permission('admin'), async (req, res) => {
    const { range } = req.params;

    // case of invalid time range for search
    if (!SEARCH_RANGE.includes(range.toUpperCase())) {
        return res.status(400).json({
            err: true,
            msg: `Please choose only form 'day', 'week', or 'month'`
        });
    }

    try {
        // returning orders that didn't exceed the selected time range
        const qry = `SELECT * FROM Orders WHERE
        TIMESTAMPDIFF(SECOND, order_time, now()) <=
        ${getSecondOfRange(range)};`;
        const data = (await myQuery(qry));
        // case of empty response
        if (data.length === 0) {
            return res.status(204).json({
                err: false,
                msg: `There are no orders in this time frame`
            });
        }
        return res.json(
            {
                err: false,
                msg: `Orders of this ${range} retrived succssesfuly`,
                data
            });
    } catch (error) {
        return res.status(500).json({ err: true, msg: error });
    }
});


// SAVE new order
router.post('/new_order', permission('user'), async (req, res) => {
    const { customer_name, customer_phone,
        customer_address, dishes, comments, order_time } = req.body;

    // case that one of the required parameter is missing
    if (!customer_name || !customer_phone ||
        !customer_address || !dishes)
        return res.status(400).json({ err: true, msg: 'Missing some info' });

    // case that some items has quantity wich is not a number
    if (Object.values(dishes).some(elem => isNaN(elem))) {
        return res.status(400).json({
            err: true,
            msg: 'The quantity of the dishes should be positive number'
        });
    }

    // case that all the items in the order are without quantity
    if (Object.values(dishes).every(elem => elem === 0)) {
        return res.status(400).json({
            err: true,
            msg: 'There is no even one dish in this order'
        });
    }

    try {
        let qry = `INSERT INTO Orders
        (customer_name, customer_phone, customer_address, dishes,
            comments ${order_time ? `, order_time` : ''})
        VALUES ('${customer_name}', '${customer_phone}',
        '${customer_address}', '${JSON.stringify(dishes)}',
        '${comments === undefined ? "" : comments}'
        ${order_time ? `, '${order_time}'` : ''});`;
        const { insertId } = await myQuery(qry); // id of the new record
        res.status(201).json({
            err: false,
            msg: `order created with Id number: ${insertId}`
        });
    } catch (error) {
        return res.status(500).json({ err: true, msg: error });
    }
});


// CHANGING an order that has not yet passed 15 minutes since it was sent
// Including chang of quantity to zero which lead to canceling
router.put('/cahnge_order/:id', permission('user'),
    validId, formatingChanges, async (req, res) => {
        
        // appending comment if it was in the request
        const { comments } = req.body

        try {
            // check if there is such order
            if ((await myQuery(`SELECT * FROM Orders
            WHERE order_id = ${req.id}`)).length === 0) {
                return res.status(404).json({
                    err: true,
                    msg: `There is no such an order`
                });
            }

            const qry = `UPDATE Orders set
            ${comments ? `comments = '${comments}', ` : ``}
            orders.dishes = JSON_SET(orders.dishes${req.sub_qry})
            WHERE order_id = ${req.id} and
            TIMESTAMPDIFF(SECOND, order_time, now())
            <= ${PERMITED_TIME_FOR_CHANGES};`;

            // preparing the response according to the change made
            const response = await myQuery(qry);
            if (response.affectedRows) {
                if (response.changedRows) {
                    return res.status(200).json({
                        err: false,
                        msg: `Update made succssesfully`
                    });
                } else {
                    return res.status(404).json({
                        err: true,
                        msg: `Nothing changed it was the same as the original`
                    });
                }

            } else {
                return res.status(404).json({
                    err: true,
                    msg: 'Not possible - 15 minutes have allready passed'
                });
            }
        } catch (error) {
            return res.status(500).json({ err: true, msg: error });
        }
    });


module.exports = router;