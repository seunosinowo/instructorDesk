import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendConfirmationEmail = async (name: string, email: string, confirmationToken: string) => {
  try {
    const emailTemplate = fs.readFileSync(path.join(__dirname, '../../emailTemplate.html'), 'utf8');
    
    const confirmationLink = `${process.env.FRONTEND_URL}/confirm?token=${confirmationToken}`;
    
    const personalizedEmail = emailTemplate
      .replace('[Name]', name)
      .replace('[ConfirmationLink]', confirmationLink);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Teacherrs - Confirm Your Email',
      html: personalizedEmail
    });

    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  try {
    const resetTemplate = fs.readFileSync(path.join(__dirname, '../../passwordResetTemplate.html'), 'utf8');
    
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const personalizedEmail = resetTemplate
      .replace('[ResetLink]', resetLink);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Teacherrs - Password Reset Request',
      html: personalizedEmail
    });

    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};
