// templates/passwordResetEmail.js
module.exports = (resetLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9f9fc;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px;
      line-height: 1.6;
      color: #444;
    }
    .content p {
      margin-bottom: 20px;
      font-size: 16px;
    }
    .btn {
      display: inline-block;
      padding: 14px 30px;
      margin: 20px 0;
      background: #6a11cb;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      transition: background 0.3s ease;
    }
    .btn:hover {
      background: #5a0fb0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #888;
      background: #f4f4f8;
      border-top: 1px solid #eee;
    }
    .note {
      font-size: 14px;
      color: #777;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FitTrack</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to create a new one.</p>
      <a href="${resetLink}" class="btn">Reset Password</a>
      <p class="note">
        This link will expire in 1 hour. If you didn’t request this, please ignore this email.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} FitTrack. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
