export interface ApiResponse<T = any> {
  status: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface ApiError {
  status: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}
