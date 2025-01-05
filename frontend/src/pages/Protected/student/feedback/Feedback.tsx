import React, { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";

const Feedback = () => {
  const [formData, setFormData] = useState({
    feedback_type: "",
    rating: 0,
    comments: "",
    anonymous: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      console.log("Form submitted:", formData);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show submitted state
      setIsSubmitted(true);
      setIsSubmitting(false);

      // Reset form after a delay
      setTimeout(() => {
        setIsSubmitted(false);
        // Reset form data
        setFormData({
          feedback_type: "",
          rating: 0,
          comments: "",
          anonymous: false,
        });
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  return (
    <div className="relative max-w-m mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Submission Popup */}
      {isSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center animate-bounce">
            <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Feedback Submitted!
            </h2>
            <p className="text-gray-600">
              {formData.anonymous
                ? "Your anonymous feedback has been received."
                : "Thank you for your valuable feedback."}
            </p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-center mb-6">
        Student Feedback Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feedback Type */}
        <div className="space-y-2">
          <label
            htmlFor="feedback_type"
            className="block text-sm font-medium text-gray-700"
          >
            Feedback Type
          </label>
          <select
            id="feedback_type"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.feedback_type}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                feedback_type: e.target.value,
              }))
            }
            required
            disabled={isSubmitting}
          >
            <option value="">Select feedback type</option>
            <option value="COURSE">Course Feedback</option>
            <option value="INSTRUCTOR">Instructor Feedback</option>
            <option value="FACILITY">Facility Feedback</option>
            <option value="GENERAL">General Feedback</option>
          </select>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="focus:outline-none transition-colors duration-200"
                disabled={isSubmitting}
              >
                <Star
                  size={32}
                  className={`${
                    formData.rating >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  } hover:fill-yellow-200 hover:text-yellow-200`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <label
            htmlFor="comments"
            className="block text-sm font-medium text-gray-700"
          >
            Comments
          </label>
          <textarea
            id="comments"
            placeholder="Share your feedback..."
            value={formData.comments}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                comments: e.target.value,
              }))
            }
            className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            role="switch"
            aria-checked={formData.anonymous}
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                anonymous: !prev.anonymous,
              }))
            }
            disabled={isSubmitting}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.anonymous ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                formData.anonymous ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <label className="text-sm font-medium text-gray-700">
            Submit Anonymously
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 active:bg-blue-800"
            } transition-colors duration-300`}
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default Feedback;
