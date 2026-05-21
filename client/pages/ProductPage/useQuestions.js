import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createQuestion, getProductQuestions } from "../../services/questionService.js";

export const useQuestions = (productId, user, isAuthenticated) => {
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    name: "",
    text: "",
  });
  const [questionErrors, setQuestionErrors] = useState({});
  const [questionSuccess, setQuestionSuccess] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setQuestionForm((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  useEffect(() => {
    if (productId) {
      fetchQuestions();
    }
  }, [productId]);

  const fetchQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      const data = await getProductQuestions(productId);
      const mappedQuestions = (data.questions || []).map((question) => ({
        id: question._id,
        name: question.name,
        text: question.text,
        answer: question.answer || "",
        date: new Date(question.createdAt).toLocaleDateString("uk-UA", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      }));
      setQuestions(mappedQuestions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSubmitQuestion = async (event) => {
    event.preventDefault();

    const errors = {};
    if (!questionForm.name.trim()) {
      errors.name = "Поле обов'язкове для заповнення";
    }
    if (!questionForm.text.trim()) {
      errors.text = "Поле обов'язкове для заповнення";
    } else if (questionForm.text.trim().length < 10) {
      errors.text = "Введіть не менше ніж 10 символів";
    }

    if (Object.keys(errors).length > 0) {
      setQuestionErrors(errors);
      return;
    }

    if (!isAuthenticated) {
      toast.error("Увійдіть, щоб поставити питання про товар");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await createQuestion(
        {
          productId,
          text: questionForm.text,
        },
        token
      );

      setQuestionErrors({});
      setQuestionForm({
        name: user?.name || "",
        text: "",
      });
      setQuestionSuccess(true);
      setShowQuestionForm(false);
    } catch (error) {
      toast.error(error.message || "Помилка відправки питання");
    }
  };

  return {
    questions,
    showQuestionForm,
    setShowQuestionForm,
    questionForm,
    setQuestionForm,
    questionErrors,
    setQuestionErrors,
    questionSuccess,
    setQuestionSuccess,
    isLoadingQuestions,
    handleSubmitQuestion,
  };
};
