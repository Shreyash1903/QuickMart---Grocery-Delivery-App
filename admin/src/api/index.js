// index.js - Combine all APIs
export { default as ordersApi } from "./ordersApi";
export { default as productsApi } from "./productsApi";
export { default as usersApi } from "./usersApi";

// Or export individual functions
export * from "./ordersApi";
export * from "./productsApi";
export * from "./usersApi";