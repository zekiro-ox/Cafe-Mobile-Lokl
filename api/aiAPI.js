import axios from "axios";

const GOOGLE_GENERATIVE_AI_API_URL =
  "https://your-google-generative-ai-endpoint"; // Replace with the correct endpoint

const callGoogleGenerativeAI = async (message) => {
  try {
    const response = await axios.post(
      GOOGLE_GENERATIVE_AI_API_URL,
      {
        prompt: message,
        // Add any other parameters required by the API
      },
      {
        headers: {
          Authorization: `Bearer ${AIzaSyBpa1wSPKRuveJ3TLq8m8CSLj4YxLop8M4}`, // Use your API key
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // Return the data from the response
  } catch (error) {
    console.error("Error calling Google Generative AI:", error);
    throw error; // Rethrow the error for further handling
  }
};
