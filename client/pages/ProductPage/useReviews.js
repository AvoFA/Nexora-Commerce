import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { getProductReviews, createReview, getUserProductReview, updateUserReview } from "../../services/reviewService.js";

export const useReviews = (productId, user, isAuthenticated) => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    stars: 0,
    text: "",
    pros: "",
    cons: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [ratingFilter, setRatingFilter] = useState(null);
  
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setNewReview((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  useEffect(() => {
    if (productId) {
      fetchReviews();
      if (isAuthenticated) {
        fetchUserReview();
      }
    }
  }, [productId, isAuthenticated]);

  const fetchUserReview = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const review = await getUserProductReview(productId, token);
      setUserReview(review || null);
    } catch (error) {
      console.error("Failed to fetch user review:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await getProductReviews(productId);
      const mappedReviews = (data.reviews || []).map(r => ({
        id: r._id,
        name: r.name,
        date: new Date(r.createdAt).toLocaleDateString("uk-UA", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        stars: r.rating,
        text: r.text,
        pros: r.pros || "",
        cons: r.cons || "",
        verified: true 
      }));
      setReviews(mappedReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    }
  };

  const { avgRating, stats } = useMemo(() => {
    if (!reviews.length) return { avgRating: "—", stats: {} };

    const sum = reviews.reduce((s, r) => s + r.stars, 0);
    const avg = (sum / reviews.length).toFixed(1);

    const counts = [5, 4, 3, 2, 1].reduce((acc, star) => {
      const count = reviews.filter((r) => r.stars === star).length;
      acc[star] = {
        count,
        percent: Math.round((count / reviews.length) * 100),
      };
      return acc;
    }, {});

    return { avgRating: avg, stats: counts };
  }, [reviews]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!newReview.stars) errors.stars = "Необхідно виставити оцінку.";
    if (!newReview.name.trim()) errors.name = "Поле обов'язкове для заповнення";
    if (!newReview.text.trim()) {
      errors.text = "Поле обов'язкове для заповнення";
    } else if (newReview.text.trim().length < 10) {
      errors.text = "Введіть не менш ніж 10 символів";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (isEditing && userReview) {
        await updateUserReview(userReview._id, {
          rating: newReview.stars,
          text: newReview.text,
          pros: newReview.pros,
          cons: newReview.cons
        }, token);
        toast.success("Ваш відгук оновлено та відправлено на модерацію");
      } else {
        await createReview({
          productId,
          rating: newReview.stars,
          text: newReview.text,
          pros: newReview.pros,
          cons: newReview.cons
        }, token);
        toast.success("Ваш відгук відправлено на модерацію");
      }

      setFormErrors({});
      setNewReview({
        name: user?.name || "",
        stars: 0,
        text: "",
        pros: "",
        cons: "",
      });
      setShowForm(false);
      setIsEditing(false);
      fetchUserReview();
    } catch (error) {
      toast.error(error.message || "Помилка відправки відгуку");
    }
  };

  return {
    reviews,
    showForm,
    setShowForm,
    newReview,
    setNewReview,
    formErrors,
    setFormErrors,
    ratingFilter,
    setRatingFilter,
    avgRating,
    stats,
    handleSubmitReview,
    userReview,
    isEditing,
    setIsEditing,
  };
};
