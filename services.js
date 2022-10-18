//--------------------
// Any logic functions
//--------------------

const SECOND_IN_MINUTE = 60;
const SECOND_IN_HOUR = SECOND_IN_MINUTE * 60;
const SECOND_IN_DAY = SECOND_IN_HOUR * 24;

const getSecondOfRange = (range) => {
    const time = new Date();
    let elapsed_time = time.getHours() * SECOND_IN_HOUR +
        time.getMinutes() * SECOND_IN_MINUTE +
        time.getSeconds();
    if (range.toUpperCase() === 'WEEK') {
        elapsed_time += time.getDay() * SECOND_IN_DAY;
    }
    if (range.toUpperCase() === 'MONTH') {
        elapsed_time += (time.getDate() - 1) * SECOND_IN_DAY;
    }
    return elapsed_time;
};

module.exports = { getSecondOfRange };