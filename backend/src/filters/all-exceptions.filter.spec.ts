import { AllExceptionsFilter } from './all-exceptions.filter';
import {
  HttpException,
  HttpStatus,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('應處理 HttpException', () => {
    const exception = new HttpException('找不到資源', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        code: 'HTTP_404',
        message: '找不到資源',
      }),
    );
  });

  it('應處理 HttpException 含物件 response', () => {
    const exception = new HttpException(
      { message: '參數驗證失敗', error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        message: '參數驗證失敗',
      }),
    );
  });

  it('應處理 Prisma P2002 唯一性約束', () => {
    const exception = new PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        code: 'P2002',
        message: '資料重複，違反唯一性約束',
      }),
    );
  });

  it('應處理 Prisma P2025 找不到記錄', () => {
    const exception = new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '5.0.0',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 404,
        code: 'P2025',
        message: '找不到要操作的記錄',
      }),
    );
  });

  it('應處理 Prisma P2003 外鍵約束', () => {
    const exception = new PrismaClientKnownRequestError(
      'Foreign key constraint',
      { code: 'P2003', clientVersion: '5.0.0' },
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'P2003',
        message: '外鍵約束違反，關聯的資料不存在',
      }),
    );
  });

  it('應處理一般 Error', () => {
    const exception = new Error('Something went wrong');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
        message: 'Something went wrong',
      }),
    );
  });

  it('應處理未知例外', () => {
    filter.catch('unknown', mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 500,
        message: '伺服器內部錯誤',
      }),
    );
  });
});
