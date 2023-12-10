const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

module.exports = { classNames };
