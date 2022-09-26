// import Mailjet from 'node-mailjet'
// //const jet = require("node-mailjet")

// // const mailjet = jet.connect(
// // 	'50af0f09d1ed3e744c652991669a9389', '3a51594aa12e46edc1630d3908cab9bb'
// //   );

// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey("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")

const Recipient = require("mailersend").Recipient;
const EmailParams = require("mailersend").EmailParams;
const MailerSend = require("mailersend");

const mailersend = new MailerSend({
    api_key: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNjRhZGEwYjIwNThlOGI4M2U2YWUyOTlhNmU1YzZiYTk2ZTlkZWVlYzk3MjRjNWJlOGIwNjYzNzE3NGUxZjJkZjY4ZWFlYTA3YmZkOGJiM2IiLCJpYXQiOjE2NjQyMjE0ODkuMTc0ODgyLCJuYmYiOjE2NjQyMjE0ODkuMTc0ODg5LCJleHAiOjQ4MTk4OTUwODkuMTY4Nzk4LCJzdWIiOiIzMjY1NiIsInNjb3BlcyI6WyJlbWFpbF9mdWxsIiwiZG9tYWluc19mdWxsIiwiYWN0aXZpdHlfZnVsbCIsImFuYWx5dGljc19mdWxsIiwidG9rZW5zX2Z1bGwiLCJ3ZWJob29rc19mdWxsIiwidGVtcGxhdGVzX2Z1bGwiLCJzdXBwcmVzc2lvbnNfZnVsbCIsInNtc19mdWxsIiwiZW1haWxfdmVyaWZpY2F0aW9uX2Z1bGwiXX0.Yz08IQEjX3Ki5XnLFjbgHcLJGQtTtT_svFaP2B4imWR8LIiWmDp9kbrpkjUf7gv6te_jmi02taFD8_kcypMZkf8bj3kyGZoL6Pk7LAuOTgeLCclpaZampSk79HqBWJU_twviTD2k8FVoPhu8oia9tEMHVCDsn6b2ETzx77tVPgyuh6Ph8qDtPfwY-px3-ilXcunSQjxOmuTclxbgbTK5C7tlXfV-RYN0d8FalY0zXwNHNeR8TQmlNrSWJzbNIsU_DOi9qLtU_2XiW3anvpxOxIV5nZtIicCoaKDPnd19beY0j4_DKE-K3cRE1tPvTTR1ipYWr9czhPp7AK6NhKphekAf23RzwayE3B9yfezNhRiXbvf68l-Dzh3QSH19myJeSkOIXQRl0mnFPFsBYYB6YfCWh91eyf75S0AqleMkrs-FL1FnjiN6iQqnyy5OESE6D_BFkRNEz4u_KhA8_EGvZI5Fi3PmbxcNJYsDD7MfimXrpQRd7sO_uItxLCRLiyidi-KGSP7pSTMFC-jiix8oV8fsRfu5qc4Us4dwjnqvV_AWpihLuDYCEy15FfdaUsM9YO3bXe_VF76gZ8tKGl6ZXfImEulS5gEsoO9JAybPj0xACwbqBqLS3KV2xVcWFokFBGDSVrfEF5rSj5-5WCzq1d3BZSSUfMLFDSSbHei83_k",
});

export const mail = async ({
	name,
  email,
  sub,
  body,
}: {
	name: string
  email: string;
  sub: string;
  body: string;
}) => {
  //const mailjet = Mailjet.apiConnect('50af0f09d1ed3e744c652991669a9389', 'e0529f6e00186b0e5560874664c76094')
// try{
// 	console.log(name,sub,body)
// 	const msg = {
// 		to: email, // Change to your recipient
// 		from: 'webops@shaastra.org', // Change to your verified sender
// 		subject: sub,
// 		content: [
// 			{
// 				type: 'text/html',
// 				value: body
// 			}
// 		]
// 	  }
// 	  await sgMail
// 		.send(msg)
// 		.then(() => {
// 		  console.log('Email sent')
// 		})
// 	// await mailjet
// 	// .post("send", {version: 'v3.1'})
// 	// .request({
// 	// 	Messages:[
// 	// 			{
// 	// 					From: {
// 	// 							Email: "test@shaastra.org",
// 	// 							Name: "Campus Ambassador"
// 	// 					},
// 	// 					To: [
// 	// 							{
// 	// 									Email: email,
// 	// 									Name: name
// 	// 							}
// 	// 					],
// 	// 					Subject: sub,
// 	// 					HTMLPart: body
// 	// 			}
// 	// 	]
// 	// }).then((result) => {
// 	// 	console.log(result)
// 	// })
// }catch(err){
// 	console.log(err)
// }

try{

	const recipients = [
	new Recipient(email, name)
	];
	const emailParams = new EmailParams()
      .setFrom("webops@shaastra.org")
      .setFromName("Shaastra Webops")
      .setRecipients(recipients)
      .setReplyTo("webops@shaastra.org")
      .setReplyToName("Shaastra Webops")
      .setSubject(sub)
      .setHtml(body)

	await mailersend.send(emailParams);
}catch(e){
	console.log(e)
}

// request
// 	.then((result: any) => {
// 		console.log(result)
// 	})
// 	.catch((err: any) => {
// 		console.log(err.statusCode)
// 	})
};

