import AWS from "aws-sdk";
import dontenv from 'dotenv';
dontenv.config();

export const S3Manager = (function () {
    const parseUrl = (fileUrl) => fileUrl.split('/')[4].split('.html')[0];

    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    let s3 = new AWS.S3();
    
    return {
        upload: function (body, fileUrl) {
            const fileName = parseUrl(fileUrl);
            var params = {
                Body: body,
                ACL: "private",
                Bucket: process.env.S3_BUCKET,
                Key: `${fileName}/pdf/${fileName}.pdf`,
            };
            s3.upload(params, function (err, data) {
                console.log(`Book ${fileName} uploaded to s3`);
            });
        },
        successfullySent: async function (fileUrl,connection) {
            const fileName = parseUrl(fileUrl);
            let successfullySent = true;
            try{
                const {Body} = await s3.getObject({
                    Bucket: process.env.S3_BUCKET,
                    Key: `${fileName}/pdf/${fileName}.pdf`,
                }).promise();
                connection.sendMessage('message', Body);
            }catch(err){
                console.log(err.message);
                successfullySent = false;
            }
            return successfullySent;
        },
    };

    
})();

