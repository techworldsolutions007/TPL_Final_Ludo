import Profile from "../model/Profile.js";
import cloudinary from "../config/cloudinaryConfig.js";
import streamifier from "streamifier";


export const playerProfile = async (req, res) => {
  try {
    // 🔹 New line added here
    // console.log(req.user._id);
    const userData = await Profile.findById(req.user._id);

    
    if (!userData) {
      return res.status(404).json({ message: "User not found with given id" });
    }
          return res.status(201).json({ userData: userData });


  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const updatePlayerProfile = async (req, res) => {
  try {
    const { id } = req.params; // player id from route
    const { first_name, last_name } = req.body;
    
    const updatedProfile = await Profile.findByIdAndUpdate(
      id,
      {
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePlayerProfileImage = async (req, res) => {
  try {
    const { id } = req.params; // player id from route
    let picUrl = req.file;

    // Function to upload image buffer to Cloudinary in high quality
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "Ludo",
            quality: "auto:best",   // ensures best quality
            fetch_format: "auto",   // keeps optimal format (webp/jpg/png)
            resource_type: "image"
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    let result;
    if (picUrl) {
      result = await streamUpload(picUrl.buffer);
    }

    const updatedProfile = await Profile.findByIdAndUpdate(
      id,
      {
        ...(picUrl && { pic_url: result.secure_url })
      },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile Image updated successfully",
      data: updatedProfile
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

