const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Review = require("../models/review.js");
const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
    try {
        req.body.author = req.user._id;
        const review = await Review.create(req.body);
        review._doc.author = req.user;
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate("author")
            .sort({ createdAt: "desc" });
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.get("/:reviewId", async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId).populate("author");
        if (!review) return res.status(404).json({ message: "Hmm... Review not found!" });
        res.status(200).json(review);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.put("/:reviewId", verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: "Hmm... Review not found!" });

        if (!review.author.equals(req.user._id)) {
            return res.status(403).json({ message: "Woah, you're not allowed to do that!" });
        }

        const updatedReview = await Review.findByIdAndUpdate(req.params.reviewId, req.body, { new: true });
        updatedReview._doc.author = req.user;
        res.status(200).json(updatedReview);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.delete("/:reviewId", verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: "Hmm... Review not found!" });

        if (!review.author.equals(req.user._id)) {
            return res.status(403).json({ message: "Woah, you're not allowed to do that!" });
        }

        await Review.findByIdAndDelete(req.params.reviewId);
        res.status(200).json({ message: "Review deleted!" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.post("/:reviewId/comments", verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: "Hmm... Review not found!" });

        req.body.author = req.user._id;
        review.comments.push(req.body);
        await review.save();

        const newComment = review.comments[review.comments.length - 1];
        newComment._doc.author = req.user;

        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.put("/:reviewId/comments/:commentId", verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: "Hmm... Review not found!" });

        const comment = review.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Well, not sure where that comment went!" });

        if (!comment.author.equals(req.user._id)) {
            return res.status(403).json({ message: "Woah now! You can't edit this comment!" });
        }

        comment.text = req.body.text;
        await review.save();

        res.status(200).json({ message: "I've got your update!" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

router.delete("/:reviewId/comments/:commentId", verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: "Can't find your review!" });

        const comment = review.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Well, not sure where that comment went!" });

        if (!comment.author.equals(req.user._id)) {
            return res.status(403).json({ message: "You think you can just delete others comments?" });
        }

        review.comments.remove({ _id: req.params.commentId });
        await review.save();

        res.status(200).json({ message: "I guess you didn't want to say anything back!" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

module.exports = router;
