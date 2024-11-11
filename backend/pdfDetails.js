const mongoose = require("mongoose");

const pdfDetailsSchema = new mongoose.Schema(
  {
    pdf: String,
    title: String,
  },
  { collection: "pdfDetails" }
);

mongoose.model("pdfDetails", pdfDetailsSchema);
