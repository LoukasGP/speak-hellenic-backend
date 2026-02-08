import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBUserRepository } from '../adapters/DynamoDBUserRepository';
import { DeleteUserUseCase } from '../domain/use-cases/DeleteUserUseCase';
import { Logger } from '../shared/logger';
import { DomainError } from '../shared/errors';

const logger = new Logger('DeleteUserHandler');
const tableName = process.env.TABLE_NAME!;

const repository = new DynamoDBUserRepository(tableName);
const useCase = new DeleteUserUseCase(repository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Delete user request received', {
    requestId: event.requestContext.requestId,
  });

  try {
    const encodedUserId = event.pathParameters?.userId;

    if (!encodedUserId) {
      return createErrorResponse(400, 'userId path parameter is required');
    }

    const userId = decodeURIComponent(encodedUserId);

    await useCase.execute(userId);

    logger.info('User deleted successfully', { userId });

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: '',
    };
  } catch (error) {
    return handleError(error);
  }
};

function handleError(error: unknown): APIGatewayProxyResult {
  if (error instanceof DomainError) {
    logger.warn('Domain error occurred', {
      code: error.code,
      message: error.message,
    });

    return createErrorResponse(error.statusCode, error.message, error.code);
  }

  logger.error('Unexpected error occurred', error as Error);

  return createErrorResponse(500, 'An internal server error occurred', 'INTERNAL_SERVER_ERROR');
}

function createErrorResponse(
  statusCode: number,
  message: string,
  code?: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      error: code || 'ERROR',
      message,
    }),
  };
}
