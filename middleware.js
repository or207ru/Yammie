//---------------------
// Middelware functions
//---------------------

// managing allowed actions for users and admin
const permission = (role) => {
    return (req, res, next) => {
        if (role !== req.headers.role)
            return res.status(403).json({
                err: true,
                msg: "you are not allowed for this action"
            });
        next();
    };
};

// checking order id format validity
const validId = (req, res, next) => {
    const { id } = req.params;

    // case of wrong type of id or bad confusing with other request
    if (isNaN(id)) {
        let msg, status;
        if (id.startsWith('time_range')) {
            msg = `Please see documentation for requesting
            orders by time range`;
            status = 303;
        } else {
            msg = `Id should be a number`;
            status = 400;
        }
        return res.status(status).json({ err: true, msg });
    }
    req.id = id;
    next();
};

// processing changes for request format
const formatingChanges = (req, res, next) => {
    const { changes } = req.body;
    if (Object.values(changes).some(elem => isNaN(elem))) {
        return res.status(400).json({
            err: true,
            msg: 'The quantity of the dishes should be a number'
        });
    };
    let sub_qry = ``;
    // formating from json notation to query string
    for (const property in changes) {
        sub_qry += `, '$.${property}', ${changes[property]}`;
    }
    req.sub_qry = sub_qry;
    next();
};

module.exports = { permission, validId, formatingChanges };