/**
 * Logger interface for dependency injection
 */
export interface Logger {
  warn(message: string, meta?: any): void;
  debug?(message: string, meta?: any): void;
}
