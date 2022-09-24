// import Mailjet from 'node-mailjet'
// //const jet = require("node-mailjet")

// // const mailjet = jet.connect(
// // 	'50af0f09d1ed3e744c652991669a9389', '3a51594aa12e46edc1630d3908cab9bb'
// //   );

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey("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")


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
try{
	console.log(name,sub,body)
	const msg = {
		to: email, // Change to your recipient
		from: 'webops@shaastra.org', // Change to your verified sender
		subject: sub,
		content: [
			{
				type: 'text/html',
				value: body
			}
		]
	  }
	  await sgMail
		.send(msg)
		.then(() => {
		  console.log('Email sent')
		})
	// await mailjet
	// .post("send", {version: 'v3.1'})
	// .request({
	// 	Messages:[
	// 			{
	// 					From: {
	// 							Email: "test@shaastra.org",
	// 							Name: "Campus Ambassador"
	// 					},
	// 					To: [
	// 							{
	// 									Email: email,
	// 									Name: name
	// 							}
	// 					],
	// 					Subject: sub,
	// 					HTMLPart: body
	// 			}
	// 	]
	// }).then((result) => {
	// 	console.log(result)
	// })
}catch(err){
	console.log(err)
}
// request
// 	.then((result: any) => {
// 		console.log(result)
// 	})
// 	.catch((err: any) => {
// 		console.log(err.statusCode)
// 	})
};

