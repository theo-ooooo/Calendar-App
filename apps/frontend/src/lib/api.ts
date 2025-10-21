const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Fetch wrapper with automatic token refresh
class ApiClient {
  private baseURL: string;
  private isRefreshing = false;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // 쿠키 자동 전송
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized with token refresh
      if (response.status === 401 && !isRetry && !this.isRefreshing) {
        this.isRefreshing = true;
        try {
          // refresh API 호출 (무한 루프 방지를 위해 isRetry 체크 없이)
          const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // 쿠키로 refresh token 전송
          });

          if (refreshResponse.ok) {
            // Retry original request
            this.isRefreshing = false;
            return this.request<T>(endpoint, options, true);
          } else {
            // Refresh failed, clear tokens and redirect to login
            this.isRefreshing = false;
            if (typeof window !== "undefined") {
              try {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
              } catch (e) {
                // localStorage might not be available
              }
              window.location.href = "/login";
            }
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          this.isRefreshing = false;
          if (typeof window !== "undefined") {
            // Clear any stored tokens (if any) - only on client side
            try {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            } catch (e) {
              // localStorage might not be available
            }
            window.location.href = "/login";
          }
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
