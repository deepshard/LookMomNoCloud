# Keychain issues
1. Make sure all the https://www.apple.com/certificateauthority/ are installed in the "System Keychain"
2. Import p12 key (on a new keychain i.e. "ci") and check if it says "The Certificate is valid" --> this is very important
3. Click on the Deepshard pk -> access control -> "Always Allow"