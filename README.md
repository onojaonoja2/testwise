# Testwise: Secure Test-Taking Application

## Project Overview

Testwise is a secure online test-taking application designed to prevent cheating and ensure fair assessments. It will leverage AI to assist in development, testing, and schema/API generation.

## Tech Stack

*   **Language(s):** Python, JavaScript
*   **Framework(s):**
    *   Backend: Django (Python) - for robust security features and ORM.
    *   Frontend: React (JavaScript) - for a responsive and interactive user interface.
*   **Database:** PostgreSQL - for secure and reliable data storage.
*   **Real-time Communication:** WebSockets (using Django Channels) - for proctoring features.
*   **Security Libraries:**  `bcrypt`, `cryptography` (Python), `helmet` (Node.js)
*   **AI Libraries:** OpenAI API (Python), potentially TensorFlow/PyTorch for future advanced features.
*   **Testing Frameworks:** Pytest (Python), Jest (JavaScript)

## AI Integration Plan

### 🧱 Code or Feature Generation

*   **Scaffolding:** AI will be used to generate basic Django models, serializers, and API endpoints.  For example, creating user authentication models or question models. AI can also create React components for displaying questions and answers.
*   **Route Generation:** Use AI to suggest URL patterns based on resource names and desired functionalities.
*   **Example Prompt:** "Generate a Django model for a 'Question' with fields: 'text' (CharField), 'options' (JSONField), 'correct_answer' (CharField), and 'difficulty' (IntegerField)."

### 🧪 Testing Support

*   **Unit Test Generation:** AI will generate unit tests for Django models, views, and React components. This includes testing model validation, API responses, and component rendering.
*   **Integration Test Generation:**  AI can generate integration tests to verify the interaction between different parts of the system, such as the frontend and backend.
*   **Example Prompt:** "Generate a unit test suite for the Django view that handles submitting a test, ensuring that the score is calculated correctly and stored in the database."
*   **Fuzzing:** Generate random inputs to test for edge cases or vulnerabilities.

### 📡 Schema-Aware or API-Aware Generation

*   **API Function Generation:** Given the Django REST Framework schema, AI will generate client-side functions in React to interact with the API.  This includes functions for creating, reading, updating, and deleting questions, tests, and user data.
*   **Database Query Generation:** AI can assist in creating optimized database queries based on the schema and the desired data retrieval.
*   **Example Prompt:** "Based on the Django REST Framework schema for the 'Question' model, generate a React function that fetches a specific question by its ID from the API."

## In-Editor/PR Review Tooling

*   **Tool:** CodeRabbit
*   **Support:**
    *   **Code Reviews:** Automated code reviews to identify potential bugs, security vulnerabilities, and code style issues.
    *   **PRs:** Generation of PR descriptions based on code changes.
    *   **Commit Messages:** Suggesting conventional commit messages based on the changes made.

## Prompting Strategy

1.  **Test Suite Generation:** "Generate a test suite for this authentication function following JWT token structure."
2.  **Model Generation:** "Create a Django model for an Exam with fields: title (CharField), description (TextField), start_time (DateTimeField), end_time (DateTimeField)."
