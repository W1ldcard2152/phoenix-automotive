// src/utils/toastUtils.js
import { toast } from '@/hooks/use-toast';

export const showToast = {
  success: (title, description) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'bg-green-50 border-green-200 text-green-800',
    });
  },

  error: (title, description) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  },

  info: (message) => {
    toast({
      description: message,
      variant: 'default',
    });
  },

  warning: (title, description) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    });
  }
};