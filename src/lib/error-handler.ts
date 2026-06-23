import { toast } from "sonner";

/**
 * Extracts and formats error messages from an API response.
 * Handles the specific format: { message: string, errors: string[] }
 */
export const getErrorMessage = (error: any): string => {
  const apiErrors = error?.response?.data?.errors;
  const apiMessage = error?.response?.data?.message;

  if (Array.isArray(apiErrors) && apiErrors.length > 0) {
    return apiErrors.join(". ");
  }

  return apiMessage || error?.message || "An unexpected error occurred. Please try again.";
};

/**
 * Utility to show an error toast with correctly extracted messages.
 */
export const showApiErrorToast = (error: any, fallbackTitle: string = "Error") => {
  const message = getErrorMessage(error);
  
  toast.error(fallbackTitle, {
    description: message,
  });
};
