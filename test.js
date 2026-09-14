const email = '8888888888';
const authMode = 'login';
const password = '';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

const isPhone = phoneRegex.test(email);
const isEmail = emailRegex.test(email);

let storedDataString = null; // simulate localstorage missing

if (!isEmail && !isPhone) {
  console.log("Please enter a valid email address or a 10-digit phone number.");
  process.exit();
}

if (authMode === 'register') {
    // ...
} else {
  // LOGIN MODE
  if (!email || (isEmail && !password)) {
    console.log("Please enter your phone number.");
    process.exit();
  }

  if (!storedDataString) {
    console.log("Account not found! This email/phone does not exist in our system. Please Sign Up first.");
    process.exit();
  }
}

if (isPhone) {
  console.log("SENDING OTP");
}
