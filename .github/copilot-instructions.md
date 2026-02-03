# Copilot Instructions for Speak Greek Now Backend

## Knowledge Base Consultation

**IMPORTANT**: Before implementing any feature or solution, you MUST:

1. **Check the knowledge base** in the `knowledge/` directory for relevant best practices and guidelines
2. **Review existing documentation** that applies to the technologies or patterns you're about to use
3. **Apply the documented best practices** from the knowledge base to your implementation
4. **Follow established patterns** already in use in the codebase

### Knowledge Base Structure

The `knowledge/` directory contains:

- Best practices for specific AWS services (e.g., API Gateway, DynamoDB)
- CDK implementation guidelines
- Architecture patterns and standards
- Technology-specific conventions

### Workflow

When asked to implement a feature:

1. **Research First**: Search the `knowledge/` directory for relevant documentation
2. **Understand Context**: Read the applicable best practice documents completely
3. **Plan Implementation**: Design your solution following the documented patterns
4. **Implement**: Write code that adheres to the knowledge base guidelines
5. **Validate**: Ensure your implementation matches the documented standards

### Example

If implementing an API endpoint:

- First check `knowledge/api-gateway.md` for API Gateway best practices
- Review any related infrastructure documentation
- Then implement following those specific guidelines

## General Guidelines

- Use TypeScript for all code
- Follow AWS CDK best practices
- Maintain consistent code style with existing patterns
- Write tests for new functionality
- Update documentation when adding features
