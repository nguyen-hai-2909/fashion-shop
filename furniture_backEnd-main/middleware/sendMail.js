const nodemailer = require('nodemailer');
const fs = require('fs');
const ejs = require('ejs');
const { convert } = require('html-to-text');
const juice = require('juice');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    // service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASSWORD_EMAIL
    }
});

const sendMail = ({
    template: templateName,
    subject,
    templateVars,
    email,
    ...restOfOptions
  }) => {
    const templatePath = `templates/${templateName}.html`; // đường dẫn tới template
    const options = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: subject,
      ...restOfOptions,
    };
  
    if (templateName && fs.existsSync(templatePath)) {
      const template = fs.readFileSync(templatePath, "utf-8");
      const html = ejs.render(template, templateVars);
      // templateVars là các biến được truyền vào template thông qua hàm render
      // const text = convert(html);
      const htmlWithStylesInlined = juice(html);
      options.html = htmlWithStylesInlined;
      // options.text = text;
    }
  
    // hàm smtp.sendMail() này sẽ trả về cho chúng ta một Promise
    return transporter.sendMail(options);
};

module.exports = {
  sendMail
}
