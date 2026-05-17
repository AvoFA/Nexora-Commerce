import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { MOCK_REVIEWS } from "./productPage.constants.js";

export const useReviews = (user, isAuthenticated) => {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
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

  useEffect(() => {
    if (user?.name) {
      setNewReview((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

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

  const handleSubmitReview = (e) => {
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

    const review = {
      id: Date.now(),
      name: newReview.name,
      date: new Date().toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      stars: newReview.stars,
      text: newReview.text,
      pros: newReview.pros,
      cons: newReview.cons,
      model: "",
      verified: isAuthenticated,
    };

    setReviews((prev) => [review, ...prev]);
    setFormErrors({});
    setNewReview({
      name: user?.name || "",
      stars: 0,
      text: "",
      pros: "",
      cons: "",
    });
    setShowForm(false);
    toast.success("Відгук додано!");
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
  };
};
