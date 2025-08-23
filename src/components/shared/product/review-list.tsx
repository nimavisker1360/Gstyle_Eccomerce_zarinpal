"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createUpdateReview,
  getReviews,
  getReviewByProductId,
} from "@/lib/actions/review.actions";
import { useToast } from "@/hooks/use-toast";
import Rating from "./rating";
import { useRouter } from "next/navigation";
import { IProduct } from "@/types";

interface ReviewListProps {
  product: IProduct;
  userId?: string;
}

export default function ReviewList({ product, userId }: ReviewListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    comment: "",
    rating: 5,
  });

  const fetchReviews = async () => {
    try {
      const result = await getReviews({
        productId: product._id,
        page,
      });
      setReviews(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchUserReview = async () => {
    if (!userId) return;
    try {
      const review = await getReviewByProductId({ productId: product._id });
      setUserReview(review);
    } catch (error) {
      console.error("Error fetching user review:", error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({
        title: "Error",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createUpdateReview({
        data: {
          product: product._id,
          title: formData.title,
          comment: formData.comment,
          rating: formData.rating,
          isVerifiedPurchase: false,
        },
        path: `/product/${product.slug}`,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setIsDialogOpen(false);
        setFormData({ title: "", comment: "", rating: 5 });
        fetchReviews();
        fetchUserReview();
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load reviews on mount
  useState(() => {
    fetchReviews();
    fetchUserReview();
  });

  return (
    <div className="space-y-6">
      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          {userReview ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Rating rating={userReview.rating} />
                <span className="font-semibold">{userReview.title}</span>
              </div>
              <p className="text-muted-foreground">{userReview.comment}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    title: userReview.title,
                    comment: userReview.comment,
                    rating: userReview.rating,
                  });
                  setIsDialogOpen(true);
                }}
              >
                Edit Review
              </Button>
            </div>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Write a Review</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating</Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, rating: star })
                          }
                          className="focus:outline-none"
                        >
                          <Rating rating={formData.rating >= star ? star : 0} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Summary of your experience"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment</Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) =>
                        setFormData({ ...formData, comment: e.target.value })
                      }
                      placeholder="Share your thoughts about this product"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Customer Reviews ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review._id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Rating rating={review.rating} />
                    <span className="font-semibold">{review.title}</span>
                  </div>
                  <p className="text-muted-foreground mb-2">{review.comment}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>By {review.user?.name || "Anonymous"}</span>
                    <span>•</span>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
