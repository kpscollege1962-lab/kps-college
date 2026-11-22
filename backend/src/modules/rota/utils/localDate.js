// 'YYYY-MM-DD' for the server's local calendar day (the school's day), not UTC.
const pad = (n) => String(n).padStart(2, '0');
const localToday = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

module.exports = { localToday };
