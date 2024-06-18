import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination


})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title || !description){
        throw new ApiError(401, "All fields required")
    }

    let videoFileLocalPath, thumbnailLocalPath;

    if(req.files && Array.isArray(req.files.videoFile)
        && req.files.videoFile.length > 0){
            videoFileLocalPath = req.files.videoFile[0].path;
    }

    if(req.files && Array.isArray(req.files.thumbnail)
        && req.files.thumbnail.length > 0){
            thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    if(!videoFileLocalPath){
        throw new ApiError(401, "video required")
    }

    if(!thumbnailLocalPath){
        throw new ApiError(401, "thumbnail required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    // console.log(videoFile);

    if(!videoFile || !thumbnail){
        throw new ApiError(400, "video or thumbnail not uploaded")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        owner: req.user._id,
        duration: videoFile.duration
    })

    const createdVideo = await Video.findById(video._id)

    if(!createdVideo){
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    return res.status(200)
              .json(
                    new ApiResponse(
                        200,
                        createdVideo,
                        "Video uploaded successfully"
                    )
              )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!isValidObjectId(videoId)){
        throw new ApiError(401, "No such videoId exists")
    }

    const video = await Video.findById(videoId)

    return res.status(200)
              .json(
                    new ApiResponse(
                        200,
                        video,
                        "Video fetched successfully"
                    )
              )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "No such videoId exists")
    }

    const { title, description } = req.body

    if(!title || !description){
        throw new ApiError(401, "All fields are required")
    }

    let thumbnailLocalPath = req?.file?.path;
    
    if(!thumbnailLocalPath){
        throw new ApiError(401, "thumbnail required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(401, "Error while uploading thumbnail")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url
            }
        },
        {
            new: true
        }
    )

    return res.status(200)
              .json(
                    new ApiResponse(
                        200,
                        video,
                        "video data updated successfully"
                    )
              )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "No such videoId exists")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(401, "No such video exists")
    }

    if(video.owner.toString() != req.user._id.toString()){
        throw new ApiError(400, "Can't delete, you are not owner of this video")
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200)
              .json(
                    new ApiResponse(
                        200,
                        {},
                        "video deleted successfully"
                    )
              )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}