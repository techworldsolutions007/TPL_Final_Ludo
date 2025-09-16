import cloudinary from "../config/cloudinaryConfig.js";
import streamifier from "streamifier";
import Profile from "../model/Profile.js";

export const Register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone , dob, gender } = req.body;
    let pic_url = req.file;
    // Validation
    if (!first_name || !last_name || !email || !phone || !dob || !gender || !pic_url) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!is18Plus(dob)) {
      return res
        .status(400)
        .json({ message: "User must be at least 18 years old" });
    }

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Ludo" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(pic_url.buffer);
    const referCode = await generateReferralCode();
    console.log("Register" + referCode)
    const newUser = new Profile({
      first_name: first_name,
      last_name: last_name,
      email: email,
      phone: phone,
      dob,
      gender,
      pic_url: result.url,
      referral_code: referCode
    });

    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", userData: newUser });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(500)
      .json({ error: "Registration failed", details: error.message });
  }
};

// PUT Method for Updating User Details
export const UpdateUser = async (req, res) => {
  try {
    const { userId } = req.params; // Get the userId from the route parameter
    const { first_name, last_name, dob, gender } = req.body;
    let pic_url = req.file; // If pic_url is updated

    // console.log("Update request for userId:", userId);
    // console.log("Received data:", { first_name, last_name, dob, gender });
    // console.log("Received file:", pic_url ? pic_url.originalname : "No file");

    // If the image is provided, upload it to Cloudinary
    let updatedPicUrl = null;
    if (pic_url) {
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "Ludo" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const result = await streamUpload(pic_url.buffer);
      updatedPicUrl = result.url;
    }

    // Find the user by ID and update the fields
    const updatedUser = await Profile.findByIdAndUpdate(
      userId,
      {
        first_name,
        last_name,
        dob,
        gender,
        pic_url: updatedPicUrl || undefined, // Only update if new image is provided
      },
      { new: true } // Returns the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

export const uploadImageToCloud = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // Upload buffer to Cloudinary using a stream
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Ludo" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const result = await streamUpload(file.buffer);

    return res.status(200).json({
      success: true,
      pic_url: result.secure_url,
      public_id: result.public_id,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Error in uploading image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload image to Cloud",
    });
  }
};

function is18Plus(dobString) {
  const [day, month, year] = dobString.split("-").map(Number);

  // Create Date object (month in JS is 0-based, so subtract 1)
  const dob = new Date(year, month - 1, day);
  const today = new Date();

  // Calculate the age
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age >= 18;
}

const generateReferralCode = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; 
  let code;
  let exists = true;

  while (exists) {
    // Generate a random 6-character alphanumeric string
    code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code already exists in DB
    const existingUser = await Profile.findOne({ referral_code: code });
    exists = !!existingUser;
  }

  return code;
};

