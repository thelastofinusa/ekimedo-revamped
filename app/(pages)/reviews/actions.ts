"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createReviewService } from "@/services/review.service";

export async function submitReview(formData: FormData) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  return await createReviewService(formData, {
    id: userId,
    fullName: user.fullName,
    firstName: user.firstName,
    email: user.primaryEmailAddress?.emailAddress,
    imageUrl: user.imageUrl,
  });
}
