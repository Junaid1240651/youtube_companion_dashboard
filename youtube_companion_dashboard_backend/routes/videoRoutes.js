import express from 'express';
import VideoController from '../controllers/videoController.js';

const router = express.Router();

// Comments routes (specific)
router.get('/:videoId/comments', VideoController.getVideoComments);
router.post('/:videoId/comments', VideoController.addComment);
router.post('/comments/:commentId/replies', VideoController.addReply);
router.delete('/comments/:commentId', VideoController.deleteComment);
router.delete('/comments/:replyId/reply', VideoController.deleteReply);

// Video details routes (general)
router.get('/:videoId', VideoController.getVideoDetails);
router.put('/:videoId', VideoController.updateVideo);

export default router;
