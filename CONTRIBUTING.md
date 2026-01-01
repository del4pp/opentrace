# Contributing to OpenTrace Analytics

Thank you for your interest in contributing to OpenTrace Analytics! We welcome contributions from everyone. By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🚀 Quick Start

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a new branch for your changes
4. **Make** your changes
5. **Test** your changes
6. **Submit** a pull request

## 📋 Development Setup

### Prerequisites

- Docker & Docker Compose
- Git
- (Optional) Python 3.11+ for local development
- (Optional) Node.js 18+ for frontend development

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/your-username/opentrace.git
cd opentrace

# Start development environment
docker-compose up -d

# Install frontend dependencies (optional)
cd frontend && npm install

# Start frontend development server (optional)
npm run dev
```

## 🐛 How to Report Bugs

Before creating a bug report, please check if the issue has already been reported in our [GitHub Issues](https://github.com/your-username/opentrace/issues).

### Bug Report Template

When reporting a bug, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs. **actual behavior**
- **Environment details** (OS, browser, Docker version, etc.)
- **Screenshots** if applicable
- **Logs** or error messages

## ✨ Feature Requests

We love hearing new ideas! When suggesting a feature:

- **Check existing issues** to avoid duplicates
- **Describe the problem** you're trying to solve
- **Explain your proposed solution**
- **Consider alternative approaches**
- **Discuss potential impact** on users and codebase

## 🔧 Development Guidelines

### Code Style

#### Python (Backend)
- Follow PEP 8 style guide
- Use type hints
- Write comprehensive docstrings
- Use meaningful variable and function names

#### JavaScript/React (Frontend)
- Use ESLint configuration
- Follow React best practices
- Use meaningful component and variable names
- Write clear comments for complex logic

### Commit Messages

We follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add OAuth2 login support
fix(dashboard): resolve chart rendering bug
docs(api): update endpoint documentation
```

### Testing

- Write tests for new features
- Ensure all existing tests pass
- Test both unit and integration scenarios
- Include edge cases and error conditions

### Pull Request Process

1. **Create a branch** from `main` for your work
2. **Write tests** for your changes
3. **Ensure code quality** (linting, formatting)
4. **Update documentation** if needed
5. **Test locally** with Docker environment
6. **Submit PR** with clear description
7. **Address review feedback**
8. **Merge** once approved

## 📚 Documentation

When contributing code that affects users:

- Update relevant documentation
- Add code examples where appropriate
- Update API documentation for backend changes
- Update setup guides for infrastructure changes

## 🔐 Security

- Never commit sensitive information (API keys, passwords, etc.)
- Report security vulnerabilities via [SECURITY.md](SECURITY.md)
- Follow secure coding practices
- Validate all user inputs
- Use parameterized queries for database operations

## 🌍 Translation

Help us make OpenTrace accessible worldwide! We support multiple languages:

- English (primary)
- Ukrainian
- Polish
- German

When adding new text or features, consider internationalization.

## 🎯 Areas for Contribution

### High Priority
- Mobile SDK development (iOS/Android)
- Advanced analytics features
- Performance optimizations
- Security enhancements

### Medium Priority
- Additional language support
- UI/UX improvements
- Integration with third-party services
- Documentation improvements

### Good for Beginners
- Bug fixes
- Documentation updates
- Test coverage improvements
- Code refactoring
- Translation improvements

## 🤝 Community

- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bugs and feature requests
- **Discord/Slack**: For real-time communication (coming soon)

## 📋 Checklist for Contributors

- [ ] Forked the repository
- [ ] Created a descriptive branch name
- [ ] Made changes following coding standards
- [ ] Added/updated tests
- [ ] Updated documentation
- [ ] Tested locally with Docker
- [ ] Committed with clear, conventional messages
- [ ] Submitted PR with detailed description

## 🎉 Recognition

Contributors are recognized in:
- Repository contributors list
- Release notes
- Community acknowledgments
- Special mentions in documentation

Thank you for contributing to OpenTrace Analytics! Your efforts help make privacy-first analytics accessible to everyone. 🚀

---

For more details, see our [full documentation](docs/index.html).
