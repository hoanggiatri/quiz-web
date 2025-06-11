import { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GoogleSignInProps {
  onSuccess: (idToken: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

// Declare global google object
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select: boolean;
            cancel_on_tap_outside: boolean;
            use_fedcm_for_prompt: boolean;
          }) => void;
          renderButton: (element: HTMLElement, options: {
            theme: string;
            size: string;
            width: number;
            text: string;
            shape: string;
            logo_alignment: string;
          }) => void;
          disableAutoSelect: () => void;
          prompt: () => void;
        };
      };
    };
    googleSignInCallback: (response: { credential?: string }) => void;
  }
}

export default function GoogleSignIn({ 
  onSuccess, 
  onError, 
  disabled = false,
  className = ""
}: GoogleSignInProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback((response: { credential?: string }) => {
    console.log('Google credential response received:', response);
    try {
      if (response.credential) {
        console.log('Google Sign-In successful, ID Token length:', response.credential.length);
        console.log('ID Token preview:', response.credential.substring(0, 50) + '...');
        onSuccess(response.credential);
      } else {
        console.error('No credential in response');
        throw new Error('Không nhận được thông tin đăng nhập từ Google');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      toast.error('Đăng nhập Google thất bại');
      if (onError) {
        onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Script loaded successfully');
      if (window.google) {
        console.log('Google object available:', window.google);
        try {
          // Initialize Google Sign-In
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
          });
          console.log('Google Sign-In initialized successfully');

          // Disable auto-select to ensure account picker shows
          window.google.accounts.id.disableAutoSelect();
          console.log('Auto-select disabled');

          // Render the sign-in button
          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(
              googleButtonRef.current,
              {
                theme: 'outline',
                size: 'large',
                width: 320,
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left'
              }
            );
            console.log('Google button rendered');
          }
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      } else {
        console.error('Google object not available after script load');
      }
    };

    script.onerror = () => {
      toast.error('Không thể tải Google Sign-In');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [clientId, handleCredentialResponse]);



  const handleManualSignIn = () => {
    console.log('Google Sign-In button clicked');
    console.log('Client ID:', clientId);
    console.log('Current hostname:', window.location.hostname);
    console.log('Window.google available:', !!window.google);
    console.log('Window.google.accounts available:', !!(window.google && window.google.accounts));

    if (window.google && window.google.accounts) {
      try {
        console.log('Attempting to show Google Sign-In prompt...');

        // Disable auto-select to force account chooser
        window.google.accounts.id.disableAutoSelect();
        console.log('Auto-select disabled');

        // Re-initialize with prompt settings to force account selection
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });
        console.log('Google Sign-In re-initialized');

        // Show the prompt with account selection
        window.google.accounts.id.prompt();
        console.log('Google prompt called');

      } catch (error) {
        console.error('Error in handleManualSignIn:', error);
        toast.error('Không thể hiển thị danh sách tài khoản Google');
      }
    } else {
      console.error('Google Sign-In not ready');
      toast.error('Google Sign-In chưa sẵn sàng');
    }
  };

  if (!clientId) {
    return (
      <Button 
        variant="outline" 
        disabled 
        className={`w-full ${className}`}
      >
        Không thể đăng nhập bằng Google
      </Button>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Custom Google Sign-In Button to match QLDT button style */}
      <Button
        type="button"
        variant="outline"
        onClick={handleManualSignIn}
        disabled={disabled}
        className="w-full h-12 text-sm font-medium border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
Chọn tài khoản Google
      </Button>

      {/* Hidden Google's rendered button for functionality */}
      <div
        ref={googleButtonRef}
        className="hidden"
      />
    </div>
  );
}
