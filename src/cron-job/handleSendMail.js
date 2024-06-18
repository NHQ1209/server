import { GET_DB } from '~/config/mongodb'
import cron from 'node-cron'
import nodemailer from 'nodemailer'

async function sendEmail(sendTo, subject, body) {
  // get setting email send
  let host = 'smtp.gmail.com';
  let port = 587;
  let secure = false;
  let account = 'eaut.kdcl@gmail.com';
  let pass = 'lvmnqeiloincqbiu';

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: host,
    port: Number.parseInt(port),
    secure: secure.BoolValue, // true for 465, false for other ports
    auth: {
      user: account,
      pass: pass,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: account, // sender address
    to: sendTo, //"abc@gmail.com, javIdol@gmail.com"
    subject: 'Cảnh báo hạn hoàn thành công việc', // Subject line
    text: body, // plain text body
    html: body, // html body
    attachments: null
  });
}

function convertDate(date) {
  let _date = new Date(date);
  return _date.getDate() + '/' + (_date.getMonth() + 1) + '/' + _date.getFullYear() + ' ' + _date.getHours() + ':' + _date.getMinutes();
}

const handleSendMail = cron.schedule(
  '* * * * *',
  async () => {
    try {
      const currentDate = new Date()
      const result = await GET_DB()
        .collection('cards')
        .find({
          isSend: true,
          endDate: { $ne: null },
          status: { $ne: 3 },
        })
        .toArray()

      console.log('result', result)
      for (let i = 0; i < result.length; i++) {
        let item = result[i]
        let date = new Date(item.endDate);
        // 1 giờ = 60 phút * 60 giây * 1000 mili giây
        let millisecondsInAnHour = 60 * 60 * 1000; 

        // Tính toán thời điểm trước 'hours' giờ từ 'date'
        let timeBefore = new Date(date.getTime() - item.hourNumber * millisecondsInAnHour);

        if (timeBefore.getDate() == currentDate.getDate() 
            && timeBefore.getMonth() == currentDate.getMonth()
            && timeBefore.getFullYear() == currentDate.getFullYear()
            && timeBefore.getHours() == currentDate.getHours()
            && timeBefore.getMinutes() == currentDate.getMinutes()
        ) {
          let noiDung = `<!DOCTYPE html>
<html lang="en">

<head>
</head>

<body>
<div style="margin: 5px auto; width: 550px; color: #000;text-align: center;">
    <img width="200"
         src="https://media.istockphoto.com/id/179014856/vi/anh/d%E1%BA%A5u-hi%E1%BB%87u-c%E1%BA%A3nh-b%C3%A1o-nguy-hi%E1%BB%83m-v%C3%A0-tam-gi%C3%A1c-nguy-hi%E1%BB%83m-tr%E1%BB%91ng-b%E1%BB%8B-c%C3%B4-l%E1%BA%ADp-macro.jpg?s=612x612&w=0&k=20&c=zbBSkmcEWPBA76-VroQGV-o2IGa65AtkeK_WkNtF4bY=" alt="image">
    <p style='margin: 0in 0in 0.0001pt; text-align: center; text-indent: 0in; font-size: 19px; font-family: "Times New Roman", serif; line-height: 1;'>
        <strong>
                <span style='font-size:35px;font-family:"Calibri","sans-serif";'>
                    Tên công việc: ${item.title} &nbsp;
                </span>
        </strong>
    </p>
    <div id="gtx-trans" style="position: absolute; left: 196px; top: -18px;">
        <div class="gtx-trans-icon"></div>
    </div>
    <p style='margin-top:0in;margin-right:0in;margin-bottom:6.0pt;margin-left:0in;text-align:center;text-indent:0in;line-height:normal;font-size:19px;font-family:"Times New Roman","serif";'>
        <strong><span style='font-family:"Calibri","sans-serif";'>&nbsp;</span></strong>
    </p>
    <p style='margin-top:0in;margin-right:0in;margin-bottom:6.0pt;margin-left:0in;text-align:center;text-indent:0in;line-height:normal;font-size:19px;font-family:"Times New Roman","serif";'>
        <strong>
                <span style='font-size:21px;font-family:"Calibri","sans-serif";'>
                    Nội dung: ${item.description}
                </span>
        </strong>
    </p>
    <p style='margin-top:0in;margin-right:0in;margin-bottom:6.0pt;margin-left:0in;text-align:center;text-indent:0in;line-height:normal;font-size:19px;font-family:"Times New Roman","serif";'>
        <span style='font-family:"Calibri","sans-serif";'>&nbsp;</span>
    </p>
    <div style=" width: 100%; background-color: #c00000; text-align: center;  display: inline-grid; display: -ms-inline-grid;  display: -moz-inline-grid;text-transform: uppercase;">
        <span style="color: white; margin: 10px 0;  font-size: 20px;"> Hạn hoàn thành: ${convertDate(item.endDate)}</span>
    </div>
</div>
</body>

</html>`

          //Email nhận: nguyenqwn@gmail.com
          await sendEmail('nguyenqwn@gmail.com', item.title, noiDung);
        }
      }
    } catch (err) {
      console.log('cron err: ', err);
    }
  },
  {
    scheduled: false,
  }
);

module.exports = handleSendMail;
