import { object, string, TypeOf } from "zod";

export const createPostSchema = object({
  body: object({
    title: string({ required_error: "Title is required" }),
    content: string({ required_error: "Content is required" }),
    image: string({ required_error: "Image is required" }),
  }),
});

export const getPostSchema = object({
  params: object({ postId: string() }),
});

export const updatePostSchema = object({
  params: object({ postId: string() }),
  body: object({
    title: string(),
    content: string(),
    image: string(),
  }).partial(),
});

export const deletePostSchema = object({
  params: object({ postId: string() }),
});

export type UpdatePostInput = TypeOf<typeof updatePostSchema>;
export type GetPostInput = TypeOf<typeof getPostSchema>["params"];
export type CreatePostInput = TypeOf<typeof createPostSchema>["body"];
export type DeletePostInput = TypeOf<typeof deletePostSchema>["params"];
