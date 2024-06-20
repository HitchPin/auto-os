class AdmiralError extends Error {
    public readonly statusCode: number;
    
    constructor(msg: string, statusCode: number) {
        super(msg);
        this.statusCode = statusCode;
        this.name = 'AdmiralError';
    }
}

class BadRequestError extends AdmiralError {
    
    constructor(msg: string) {
        super(msg, 400);
        this.name = 'BadRequest';
    }
}

class DuplicateError extends AdmiralError {
    
    constructor(msg: string) {
        super(msg, 409);
        this.name = 'Duplicate';
    }
}

class NotFoundError extends AdmiralError {
    
    constructor(msg: string) {
        super(msg, 404);
        this.name = 'NotFound';
    }
}

export {
    AdmiralError,
    DuplicateError,
    BadRequestError,
    NotFoundError
}