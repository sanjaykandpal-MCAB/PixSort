const cookieParser = require('cookie-parser');
const express = require('express')
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const cookie = require('cookie');

const app = express();

app.use(cors({
	origin: ["http://localhost:3000"],
	methods: ["GET", "POST", "OPTIONS"],
	credentials: true
}));

var userid = 0;

app.use(session({
	secret: "secret",
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false,
		maxAge: 1000 * 60 * 60 * 24 * 7
	} //set the session cookie properties
}))

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());


app.post('/signout', (req, res) => {
	// Destroy the session on the server
	userid = 0;
	req.session.destroy((err) => {
		if (err) {
			console.error('Error destroying session:', err);
			return res.status(500).send('Internal Server Error');
		}

		// Clear the session cookie on the client
		res.clearCookie('connect.sid');
		return res.status(200).send('OK');
	});
});

const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "root123",
	database: "signup"
})

db.connect((err) => {
	if (err) {
		console.error('Error connecting to MySQL database:', err);
	} else {
		console.log('Connected to MySQL database');
	}
});


// Handle file upload
// app.post('/upload', upload.array('files'), async (req, res) => {
//   try {
//     // Access uploaded files in req.files array
//     const files = req.files;

//     // Create a random directory
//     const randomDirectory = createRandomDirectory();
//     await fs.mkdir(randomDirectory);

//     // Process and save files to the random directory
//     const uploadedFiles = [];
//     for (const file of files) {
//       const filename = `${file.originalname}`;
//       const filePath = path.join(randomDirectory, filename);

//       // Save file to disk
//       await fs.writeFile(filePath, file.buffer);

//       uploadedFiles.push({
//         originalname: file.originalname,
//         filename: filename,
//         filePath: filePath,
//       });
//     }
//     const randomCode = path.basename(randomDirectory);

//     // Send a response with information about the uploaded files and directory
//     res.status(200).json({ message: 'Files uploaded successfully', randomCode: randomCode });
//   } catch (error) {
//     // Handle errors
//     console.error('An error occurred during file upload:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

app.post('/signup', async (req, res) => {
	try {
		// Insert into signup table
		const sql1 = "INSERT INTO signup(`name`,`email`,`password`) VALUES (?)";
		const values = [req.body.name, req.body.email, req.body.password];
		await db.query(sql1, [values]);

		console.log(values)

		// Select from signup table
		const sql2 = "SELECT * FROM signup WHERE `email` = ? AND `password` = ?";
		const data2 = await db.query(sql2, [req.body.email, req.body.password]);
		// const sql2 = "SELECT * FROM signup WHERE `email` = ? AND `password` = ?";
		// const [userData] = await db.query(sql2, [req.body.email, req.body.password]);


		console.log(data2)
		if (data2.length > 0) {
			const useridTemp = data2[0].id;

			// Insert into user_access table
			const sql3 = "INSERT INTO user_access(`id`,`partycode`) VALUES (?, '[]')";
			const data3 = await db.query(sql3, useridTemp);

			console.log(data3);
			return res.json(data3);
		} else {
			return res.json({ error: "User not found" });
		}
	} catch (error) {
		console.error(error.message);
		return res.json({ error: error.message });
	}
});

// app.post('/signup', (req, res) => {
// 	const sql = "INSERT INTO signup(`name`,`email`,`password`) VALUES (?)";
// 	const values = [
// 		req.body.name,
// 		req.body.email,
// 		req.body.password
// 	]
// 	console.log(values);
// 	db.query(sql, [values], (err, data) => {
// 		if (err) {
// 			console.log(err.message);
// 			return res.json({ error: err.message });
// 		} else {
// 			const sql2 = "SELECT * FROM signup WHERE `email` = ? AND `password` = ?";
// 			db.query(sql2, [req.body.email, req.body.password], (err, data) => {
// 				if (err) {
// 					console.log(err.message);
// 					return res.json({ error: err.message });
// 				}
// 				if (data.length > 0) {
// 					console.log("122: data" + data)
// 					const useridTemp = data[0].id;
// 					const sql3 = "INSERT INTO user_access(`id`,`partycode`) VALUES (?, '[]')";
// 					db.query(sql3, useridTemp, (err, data) => {
// 						if (err) {
// 							console.log(err.message);
// 							return res.json({ error: err.message });
// 						}
// 						console.log(data);
// 						return res.json(data);
// 					})
// 				} else {
// 					console.log(err.message);
// 					return res.json({ error: err.message });
// 				}
// 			})
// 		}
// 	})

// })

app.get('/', (req, res) => {

	if (req.session.username) {

		const sql = "SELECT * FROM user_access WHERE `userid` = ?";
		db.query(sql, userid, (err, data) => {
			if (err) {
				console.log(err.message);
				return res.json({ valid: false, error: err.message });
			}

			if (data.length > 0) {
				console.log("Hey" + userid)
				let codes = JSON.parse(data[0].partycode)
				console.log(codes.length)

				if (codes.length === 0) {
					// Handle the case where partycode array is empty
					// return res.json({ valid: false, error: 'Partycode array is empty' });
					return res.json({ valid: true, username: req.session.username, cookie: req.cookies, userCodes: [] });
				}

				const placeholders = Array.from({ length: codes.length }, (_, i) => '?').join(',');

				const sql = `SELECT partycode, title FROM albums WHERE \`partycode\` IN (${placeholders})`;
				db.query(sql, codes, (err, data) => {
					if (err) {
						return res.json({ valid: false, error: err.message });
					}
					if (data.length > 0) {
						const userCodes = data.map(row => ({ title: row.title, partycode: row.partycode }));
						return res.json({ valid: true, username: req.session.username, cookie: req.cookies, userCodes: userCodes });
					} else {
						return res.json({ valid: false });
					}
				})

			} else {
				return res.json({ valid: false });
			}
		})

	} else {
		return res.json({ valid: false });
	}

})

app.post('/login', (req, res) => {
	const sql = "SELECT * FROM signup WHERE `email` = ? AND `password` = ?";
	console.log(req.body.email, req.body.password)
	db.query(sql, [req.body.email, req.body.password], (err, data) => {
		console.log("inlogin")
		if (err) {
			console.log(err.message)
			return res.json({ error: err.message });
		}
		if (data.length > 0) {
			console.log(data)
			req.session.username = data[0].name;
			req.session.userid = data[0].id;
			userid = req.session.userid;
			console.log(req.session.username);
			console.log(req.session.userid);
			return res.json({ message: true });
		} else {
			return res.json({ message: false });
		}
	})
})

app.post('/upload', (req, res) => {
	const { partyCode, title } = req.body;

	const sql = 'INSERT INTO albums (partyCode, title, date, owner) VALUES (?, ?, NOW(), ?)';

	if (userid != 0) {
		db.query(sql, [partyCode, title, userid], (err, result) => {
			if (err) {
				console.error('MySQL query error:', err);
				res.status(500).json({ error: 'Internal Server Error' });
			} else {

				const sql2 = "SELECT partycode FROM user_access WHERE `userid` = ?";
				db.query(sql2, userid, (err, data) => {
					if (err) {
						console.error('MySQL query error:', err);
						res.status(500).json({ error: 'Internal Server Error' });
					}
					if (data.length > 0) {
						let codes = JSON.parse(data[0].partycode)
						codes.push(partyCode)
						console.log(codes)
						let codeString = JSON.stringify(codes)


						const sql3 = 'update user_access set partycode=? WHERE USERID=?;';
						if (userid != 0) {
							db.query(sql3, [codeString, userid], (err, result) => {
								if (err) {
									console.error('MySQL query error:', err);
									res.status(500).json({ error: 'Internal Server Error' });
								} else {
									console.log('Upload data inserted into MySQL');
									res.status(200).json({ message: 'Upload successful', user: userid });
								}
							});
						} else {
							res.status(401).json({ error: 'Unauthorized' });
						}

					} else {
						console.error('MySQL query error:', err);
						res.status(500).json({ error: 'Internal Server Error' });
					}
				})
				// console.log('Upload data inserted into MySQL');
				// res.status(200).json({ message: 'Upload successful', user: userid });
			}
		});
	} else {
		res.status(401).json({ error: 'Unauthorized' });
	}




});




app.listen(8081, () => {
	console.log('listening');
})