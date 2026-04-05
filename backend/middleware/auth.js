module.exports = (req, res, next) => {
    const token = req.headers['x-admin-token'];
    if (token === 'apnidukanspn9140') return next();
    return res.status(401).json({ error: 'Unauthorized Admin Access' });
};
