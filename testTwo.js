const userInput = req.query.username;
const query = `SELECT * FROM users WHERE username = '${userInput}'`;
db.query(query, (err, result) => {
  if (err) throw err;
  console.log(result);
});
