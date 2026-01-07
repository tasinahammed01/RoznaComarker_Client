import { Injectable } from '@angular/core';

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private readonly CLIENT_ID = '705201289510-ev7pq4fbsh0k3ctg4k7ds59j6p7iv5bp.apps.googleusercontent.com'; 

  /**
   * Initialize Google Sign-In
   */
  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      // Wait for Google library to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Google Sign-In library failed to load'));
      }, 5000);
    });
  }

  /**
   * Sign in with Google and get ID token
   */
  signIn(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.initialize()
        .then(() => {
          window.google.accounts.id.initialize({
            client_id: this.CLIENT_ID,
            callback: (response: any) => {
              if (response.credential) {
                resolve(response.credential);
              } else {
                reject(new Error('No credential received from Google'));
              }
            }
          });

          // Use one-tap sign-in
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // Fallback: show button or use popup
              this.showPopupSignIn()
                .then(resolve)
                .catch(reject);
            }
          });
        })
        .catch(reject);
    });
  }

  /**
   * Fallback: Popup-based sign-in
   */
  private showPopupSignIn(): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: this.CLIENT_ID,
        scope: 'openid profile email',
        callback: (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            // Exchange access token for ID token
            fetch('https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + tokenResponse.access_token)
              .then(res => res.json())
              .then(data => {
                // For now, we need to get the ID token differently
                // This is a simplified approach - you might need to adjust
                reject(new Error('Please use the Google Sign-In button'));
              })
              .catch(reject);
          } else {
            reject(new Error('Failed to get access token'));
          }
        }
      });

      client.requestAccessToken();
    });
  }

  /**
   * Render Google Sign-In button
   */
  renderButton(elementId: string, callback: (credential: string) => void): void {
    this.initialize().then(() => {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Element ${elementId} not found`);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: this.CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            callback(response.credential);
          }
        }
      });

      // Clear element and render button
      element.innerHTML = '';
      
      // Get element width for button sizing (use pixel value, not percentage)
      const elementWidth = element.offsetWidth || 64; // Default to 64px (w-16 = 64px)
      
      window.google.accounts.id.renderButton(
        element,
        { 
          theme: 'outline', 
          size: 'large',
          width: elementWidth, // Use pixel value instead of percentage
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );
    }).catch(error => {
      console.error('Failed to render Google button:', error);
    });
  }
}
