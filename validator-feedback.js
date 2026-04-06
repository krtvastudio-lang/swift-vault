/**
 * Validator Feedback SDK - Service Module
 * Project: Swift Vault
 *
 * Handles communication with the Software Factory Validator API
 * for submitting bug reports and feature requests.
 */

const FEEDBACK_TYPES = ['bug', 'feature_request'];
const PRIORITIES = ['low', 'medium', 'high'];

const ValidatorFeedback = {
  appKey: 'sf-int-EYOtqlP67YbIUkdItcqHLfBmhzaHIiHF',
  endpoint: 'https://api.factory.8090.dev/v1/integration/validator/feedback',

  /**
   * Validates the feedback payload before submission.
   * @param {Object} feedback - The feedback data to validate.
   * @returns {{ valid: boolean, error?: string }}
   */
  validate(feedback) {
    if (!feedback.description || feedback.description.trim().length === 0) {
      return { valid: false, error: 'Feedback description is required.' };
    }
    if (feedback.description.trim().length < 10) {
      return { valid: false, error: 'Please provide at least 10 characters of detail.' };
    }
    if (feedback.type && !FEEDBACK_TYPES.includes(feedback.type)) {
      return { valid: false, error: `Invalid feedback type. Must be one of: ${FEEDBACK_TYPES.join(', ')}` };
    }
    if (feedback.priority && !PRIORITIES.includes(feedback.priority)) {
      return { valid: false, error: `Invalid priority. Must be one of: ${PRIORITIES.join(', ')}` };
    }
    if (feedback.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email)) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }
    return { valid: true };
  },

  /**
   * Extracts the current route/page name without exposing full URLs.
   * @returns {string} The current page path or route name.
   */
  getPageContext() {
    if (typeof window === 'undefined') return 'unknown';
    // Only return the pathname — never the full URL with domain/query params
    return window.location.pathname || '/';
  },

  /**
   * Submits feedback to the Validator API.
   * @param {Object} feedback
   * @param {string} feedback.description - Detailed description (required, min 10 chars).
   * @param {string} [feedback.type='bug'] - 'bug' | 'feature_request'
   * @param {string} [feedback.priority='medium'] - 'low' | 'medium' | 'high'
   * @param {string} [feedback.email] - Optional contact email.
   * @returns {Promise<{ success: boolean, feedback_id: string, message: string }>}
   */
  async submit(feedback) {
    const validation = this.validate(feedback);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const payload = {
      description: feedback.description.trim(),
      feedback_type: feedback.type || 'bug',
      priority: feedback.priority || 'medium',
      user_email: feedback.email || null,
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Key': this.appKey,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before submitting again.');
      }

      if (!response.ok) {
        throw new Error(`Submission failed (${response.status}). Please try again later.`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw error;
    }
  },
};

export default ValidatorFeedback;
export { FEEDBACK_TYPES, PRIORITIES };
