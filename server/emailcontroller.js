import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// console.log(process.env.hostemail); 
// console.log(process.env.hostpassword); 
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.hostemail,
    pass: process.env.hostpassword,
  },
});


 export const  sendEmail = async (receivermail, name) =>  {
  try{
    const info = await transporter.sendMail({
    from: `Payu <${process.env.hostemail}>`, 
    to: `${receivermail}`,
    subject: "Greetings! ",
    text: ``, 
    html: ```<b>Welcome to UPay ${name}
        We are happy to onboard you with our platfrom. 
        
        Make safe and secure payments where UPay!</b>```,
     
  });

  }catch(e){
    console.log(e.message); 
  }
  
};


// generating a random 6 digit OTP
// export const OTP = () => {
//   return Math.floor(100000 + Math.random() * 900000);

// }
