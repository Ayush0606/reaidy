# Contributing to AI Personal Finance Advisor

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Enhancements

1. Check if the enhancement has been suggested
2. Create an issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

#### Before Starting

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Ensure you can run the project locally

#### Development Process

1. **Write Code**
   - Follow existing code style
   - Add comments for complex logic
   - Keep functions small and focused
   - Use meaningful variable names

2. **Write Tests**
   - Add tests for new features
   - Ensure all tests pass: `npm test`
   - Aim for good test coverage

3. **Update Documentation**
   - Update README if needed
   - Add API documentation for new endpoints
   - Include JSDoc comments for functions

4. **Commit Messages**
   ```
   type(scope): subject

   body (optional)

   footer (optional)
   ```
   
   Types: feat, fix, docs, style, refactor, test, chore
   
   Examples:
   - `feat(transactions): add bulk delete functionality`
   - `fix(auth): resolve token expiration issue`
   - `docs(api): update authentication endpoints`

5. **Before Submitting**
   - Rebase on latest main branch
   - Run linting: `npm run lint`
   - Run tests: `npm test`
   - Build successfully: `npm run build`

#### Submitting Pull Request

1. Push to your fork
2. Open Pull Request to main repository
3. Fill out PR template with:
   - Description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots if UI changes

4. Wait for review
   - Address feedback promptly
   - Keep PR focused on one feature/fix
   - Update PR based on review comments

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Git

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/your-username/ai-finance-advisor.git
cd ai-finance-advisor

# Add upstream remote
git remote add upstream https://github.com/original/ai-finance-advisor.git

# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Install frontend dependencies
cd ../frontend
npm install

# Run tests
cd ../backend
npm test
```

## Project Structure

### Backend
```
backend/
├── src/
│   ├── controllers/   # Route handlers
│   ├── models/        # Database schemas
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   ├── services/      # Business logic
│   └── utils/         # Helper functions
├── tests/             # Test files
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── context/       # React context
│   ├── services/      # API clients
│   └── App.jsx
└── package.json
```

## Coding Standards

### JavaScript/React
- Use ES6+ features
- Use functional components with hooks
- Use async/await over promises
- Handle errors appropriately
- Avoid nested callbacks

### Backend
- Use RESTful conventions
- Validate all inputs
- Use proper HTTP status codes
- Include error messages
- Log important events

### Frontend
- Keep components focused
- Use PropTypes or TypeScript
- Handle loading and error states
- Make UI responsive
- Optimize performance

### CSS/Styling
- Use Tailwind utility classes
- Keep custom CSS minimal
- Follow mobile-first approach
- Ensure accessibility (a11y)

## Testing Guidelines

### Backend Tests
- Test all API endpoints
- Test authentication/authorization
- Test error handling
- Test edge cases
- Use meaningful test descriptions

### Frontend Tests (Future)
- Test user interactions
- Test component rendering
- Test API integration
- Test form validation

## Documentation

### Code Comments
```javascript
/**
 * Brief description of function
 * 
 * @param {string} userId - User ID
 * @param {object} options - Configuration options
 * @returns {Promise<object>} Result object
 */
async function exampleFunction(userId, options) {
  // Implementation
}
```

### API Documentation
- Document all endpoints
- Include request/response examples
- List required parameters
- Describe error responses

## Review Process

### For Reviewers
- Be constructive and helpful
- Focus on code quality and functionality
- Check for security issues
- Verify tests pass
- Ensure documentation is updated

### For Contributors
- Respond to feedback professionally
- Make requested changes promptly
- Ask questions if unclear
- Don't take criticism personally

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in project documentation

## Questions?

- Open an issue for discussion
- Check existing documentation
- Review closed issues/PRs for similar topics

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
