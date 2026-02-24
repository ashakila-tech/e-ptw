import { useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { crossPlatformAlert } from "@/utils/CrossPlatformAlert";
import * as api from "../../shared/services/api";

export const useFeedbackForm = () => {
  const router = useRouter();
  const { userId, userName, profile } = useUser();
  
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

      const companyName = profile?.company_name || "Unknown Company";

      // Send email notification to admin
      await api.sendNotificationToAdmin({
        title: `New Feedback Submitted: "${title}"`,
        message: `
          <p>DO NOT REPLY TO THIS EMAIL.</p>
          <p>
            User ${userName} (ID: ${userId}) from ${companyName} has submitted new feedback.
          </p>
          <p>
            Title: ${title}
            <br/><br/>
            Message: ${message}
          </p>
          <p>USE THE ADMIN CONSOLE TO VIEW ALL FEEDBACK.</p>
        `,
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