const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.use("/files", express.static("files")); //will be accessible from anywhere and return the data

//https://www.youtube.com/watch?v=mKmxc8TcWQ8&ab_channel=ArpanNeupane
// mongodb connection -----------------------
const mongoURL =
  "mongodb+srv://admin:cs294@cluster0.t5es4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoURL)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));

// multer -----------------------
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./pdfDetails");
const pdfSchema = mongoose.model("pdfDetails");
const upload = multer({ storage: storage });

app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  const fileName = req.file.filename;
  try {
    await pdfSchema.create({ title: title, pdf: fileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-files", async (req, res) => {
  try {
    pdfSchema.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

// apis -----------------------
app.get("/", async (req, res) => {
  res.send("Success!!!");
});

app.listen(8080, () => {
  console.log("Server started on port 8080");
});
