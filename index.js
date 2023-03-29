import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
dotenv.config();

const app = express();

const s3 = new AWS.S3({
  endpoint: process.env.SPACES_ENDPOINT,
  accessKeyId: process.env.SPACES_ACCESS_KEY,
  secretAccessKey: process.env.SPACES_SECRET_KEY,
});

const upload = multer();

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Create record in the database
    const record = await prisma.image.create({
      data: {},
    });

    // Save file to DigitalOcean Spaces
    const file = req.file;
    const key = `${record.id}`;
    const params = {
      Bucket: process.env.SPACES_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
    };
    await s3.upload(params).promise();

    console.log(
      `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_ENDPOINT}/paddlefest/${key}`
    );

    res.send(
      `https://${process.env.SPACES_BUCKET_NAME}.${process.env.SPACES_ENDPOINT}/paddlefest/${key}`
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/upload", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Upload Image</title>
      </head>
      <body>
        <h1>Upload Image</h1>
        <form action="/upload" method="POST" enctype="multipart/form-data">
          <input type="file" name="file">
          <br><br>
          <button type="submit">Upload</button>
        </form>
      </body>
    </html>
  `);
});

app.get("/image/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve image record from the database
    const image = await prisma.image.findUnique({ where: { id } });

    if (!image) {
      res.status(404).json({ message: "Image not found" });
      return;
    }

    // Generate pre-signed URL that will expire in 2 minutes
    const key = id;
    const params = {
      Bucket: process.env.SPACES_BUCKET_NAME,
      Key: key,
      Expires: 120, // 2 minutes
    };
    const url = await s3.getSignedUrlPromise("getObject", params);

    // Create record in the ImageView table
    await prisma.imageView.create({
      data: {
        image: {
          connect: {
            id,
          },
        },
      },
    });

    // Get file stream from S3 and pipe it to the response
    const s3Stream = s3
      .getObject({ Bucket: process.env.SPACES_BUCKET_NAME, Key: key })
      .createReadStream();
    s3Stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/events", async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        images: true,
      },
    });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
