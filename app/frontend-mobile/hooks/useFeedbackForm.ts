import { useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { crossPlatformAlert } from "@/utils/CrossPlatformAlert";
import * as api from "../../shared/services/api";

export const useFeedbackForm = () => {
  const router = useRouter();
  const { userId, userName } = useUser();
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    if (!title.trim() || !message.trim()) {
      crossPlatformAlert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await api.createFeedback({
        user_id: Number(userId),
        title,
        message,
      });

      // Send email notification to admin
      await api.sendNotificationToAdmin({
        title: `New Feedback Submitted: "${title}"`,
        message: `User ${userName} (ID: ${userId}) has submitted new feedback.\n\n---\n\nTitle: ${title}\n\nMessage:\n${message}`,
      });

      crossPlatformAlert("Success", "Thank you for your feedback!");
      router.back();
    } catch (error: any) {
      crossPlatformAlert("Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return {
    title,
    setTitle,
    message,
    setMessage,
    loading,
    submitFeedback,
  };
};