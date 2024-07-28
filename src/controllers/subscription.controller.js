import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Not valid object id")
    }

    const channel = await Subscription.find({
        subscriber: req.user?._id,
        channel: channelId
    })

    let isSubscribed;
    if(channel){
        const deleteSubscribe = await Subscription.findByIdAndDelete(channel._id)
        if(!deleteSubscribe){
            throw new ApiError(501, "Error in unsubscribing")
        }
        isSubscribed = false;
    }
    else{
        const createSubscribe = await Subscription.create({
            channel: new mongoose.Types.ObjectId(channelId),
            subscriber: req.user?._id
        })
        if(!createSubscribe){
            throw new ApiError(501, "Error in subscribing")
        }
        isSubscribed = true;
    }

    return res.status(200)
              .json(
                new ApiResponse(
                    200,
                    isSubscribed,
                    "Subscription toggled successfully"
                )
              )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Not a valid object id")
    }

    const subscribers = await Subscription.find({
        channel: channelId
    })

    if (!subscribers) {
        throw new ApiError(501, "No subscribers found")
    }

    res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(401, "Not a valid object id")
    }

    const channels = await Subscription.find({
        subscriber: subscriberId
    })

    if (!channels) {
        throw new ApiError(501, "No channels found")
    }

    res.status(200).json(
        new ApiResponse(200, channels, "Channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}