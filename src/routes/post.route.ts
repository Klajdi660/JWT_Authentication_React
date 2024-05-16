import { Router } from "express";
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  getPostsHandler,
  parsePostFormData,
  updatePostHandler,
} from "../controllers";
import { deserializeUser, requireUser, validate } from "../middleware";
import {
  createPostSchema,
  deletePostSchema,
  getPostSchema,
  updatePostSchema,
} from "../schema";
import { uploadPostImageDisk } from "../upload/single-upload-disk";
import {
  resizePostImage,
  uploadPostImage,
} from "../upload/single-upload-sharp";
import {
  resizePostImages,
  uploadPostImages,
} from "../upload/multi-upload-sharp";

const router = Router();

router.use(deserializeUser, requireUser);
router
  .route("/")
  .post(
    uploadPostImage,
    resizePostImage,
    parsePostFormData,
    validate(createPostSchema),
    createPostHandler
  )
  .get(getPostsHandler);

router
  .route("/:postId")
  .get(validate(getPostSchema), getPostHandler)
  .patch(
    uploadPostImage,
    resizePostImage,
    parsePostFormData,
    validate(updatePostSchema),
    updatePostHandler
  )
  .delete(validate(deletePostSchema), deletePostHandler);

export default router;
