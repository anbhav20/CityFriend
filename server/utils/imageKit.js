// @imagekit/nodejs is an ESM-only package, so we use dynamic import() in CommonJS
const uploadToImagekit = async (file) => {
  const { default: ImageKit, toFile } = await import("@imagekit/nodejs");

  const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  });

  const uploaded = await imagekit.files.upload({
    file: await toFile(Buffer.from(file.buffer), file.originalname),
    fileName: "uploads/" + Date.now() + "_" + file.originalname,
  });

  return uploaded.url;
};

module.exports = { uploadToImagekit };