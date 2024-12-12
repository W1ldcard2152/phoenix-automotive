import { toast } from '@/components/ui/use-toast';

export const showToast = {
  success: (message) => {
    toast({
      title: "Success",
      description: message,
      variant: "success",
      duration: 5000,
    });
  },

  error: (message, details) => {
    toast({
      title: "Error",
      description: details ? `${message}: ${details}` : message,
      variant: "destructive",
      duration: 7000,
    });
  },

  warning: (message) => {
    toast({
      title: "Warning",
      description: message,
      variant: "warning",
      duration: 5000,
    });
  },

  info: (message) => {
    toast({
      title: "Info",
      description: message,
      duration: 3000,
    });
  }
};