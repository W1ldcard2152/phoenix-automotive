// src/utils/csrfUtils.js

export const generateCsrfToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const setCsrfCookie = (token) => {
  // Set a cookie that will be accessible by JS
  document.cookie = `csrfToken=${token};path=/;max-age=${24 * 60 * 60};SameSite=Lax`;
};

export const getCsrfToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrfToken=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  
  // If no token exists, create one
  const newToken = generateCsrfToken();
  setCsrfCookie(newToken);
  return newToken;
};