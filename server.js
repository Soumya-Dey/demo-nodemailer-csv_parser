const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const port = process.env.PORT || 8000;

// middlewares
app.use(express.json({ extended: false }));

// multer
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./data");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

// routes
app.get("/", (req, res) => res.send("nodemailer demo"));

app.post("/upload", upload.single("data"), (req, res) => {
  const { path } = req.file;
  const { separator = " " } = req.body;
  const results = [];

  fs.createReadStream(path)
    .pipe(csv({ separator }))
    .on("data", (data) => results.push(data))
    .on("end", () => {
      if (results.length === 0) return res.status(400).send("No data");
      res.json(results);
    });
});

app.post("/send", async (req, res) => {
  const { toMail } = req.body;

  const to = toMail.join(", ");

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "lew.yundt@ethereal.email",
      pass: "aMJ5SgAb29GsrK2YrG",
    },
  });

  const info = await transporter.sendMail({
    from: "lew.yundt@ethereal.email",
    to,
    subject: "Hello ✔ | Nodemailer Demo",
    html: "<h1>hello world!<h1>",
  });

  console.log("Message sent: %s", info.messageId);

  res.json(info);
});

app.listen(port, () => console.log(`server started on port ${port}`));
